<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Listing;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ConversationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $conversations = Conversation::query()
            ->where(fn ($q) => $q->where('guest_id', $user->id)->orWhere('host_id', $user->id))
            ->with(['listing:id,title,destination', 'guest:id,name', 'host:id,name', 'messages' => fn ($q) => $q->latest()->limit(1)])
            ->latest()
            ->get()
            ->map(fn (Conversation $c) => $this->format($c, $user->id));

        return response()->json(['data' => $conversations]);
    }

    public function show(Request $request, Conversation $conversation): JsonResponse
    {
        $user = $request->user();

        if ($conversation->guest_id !== $user->id && $conversation->host_id !== $user->id) {
            abort(403);
        }

        $conversation->load('listing:id,title,destination', 'guest:id,name,email', 'host:id,name,email', 'messages.sender:id,name');

        // Mark messages from the other side as read
        $conversation->messages()
            ->where('sender_id', '!=', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['data' => $this->formatFull($conversation, $user->id)]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'listing_id' => ['required', 'integer', 'exists:listings,id'],
            'message' => ['required', 'string', 'max:2000'],
        ]);

        $listing = Listing::findOrFail($data['listing_id']);
        $user = $request->user();

        if ($listing->host_id === $user->id) {
            return response()->json(['message' => 'You cannot message your own listing.'], 422);
        }

        $conversation = Conversation::firstOrCreate(
            ['listing_id' => $listing->id, 'guest_id' => $user->id],
            ['host_id' => $listing->host_id],
        );

        $conversation->messages()->create([
            'sender_id' => $user->id,
            'body' => $data['message'],
        ]);

        $conversation->load('listing:id,title,destination', 'guest:id,name', 'host:id,name', 'messages.sender:id,name');

        return response()->json(['data' => $this->formatFull($conversation, $user->id)], 201);
    }

    public function reply(Request $request, Conversation $conversation): JsonResponse
    {
        $user = $request->user();

        if ($conversation->guest_id !== $user->id && $conversation->host_id !== $user->id) {
            abort(403);
        }

        $data = $request->validate(['body' => ['required', 'string', 'max:2000']]);

        $message = $conversation->messages()->create([
            'sender_id' => $user->id,
            'body' => $data['body'],
        ]);

        $message->load('sender:id,name');

        return response()->json([
            'data' => [
                'id' => $message->id,
                'body' => $message->body,
                'senderId' => $message->sender_id,
                'senderName' => $message->sender->name,
                'isMine' => true,
                'createdAt' => $message->created_at?->toISOString(),
            ],
        ], 201);
    }

    private function format(Conversation $c, int $userId): array
    {
        $lastMsg = $c->messages->first();

        return [
            'id' => $c->id,
            'listing' => ['id' => $c->listing->id, 'title' => $c->listing->title, 'destination' => $c->listing->destination],
            'otherParty' => $c->guest_id === $userId
                ? ['id' => $c->host->id, 'name' => $c->host->name]
                : ['id' => $c->guest->id, 'name' => $c->guest->name],
            'lastMessage' => $lastMsg ? ['body' => $lastMsg->body, 'createdAt' => $lastMsg->created_at?->toISOString()] : null,
            'createdAt' => $c->created_at?->toISOString(),
        ];
    }

    private function formatFull(Conversation $c, int $userId): array
    {
        return [
            'id' => $c->id,
            'listing' => ['id' => $c->listing->id, 'title' => $c->listing->title, 'destination' => $c->listing->destination],
            'guest' => ['id' => $c->guest->id, 'name' => $c->guest->name, 'email' => $c->guest->email],
            'host' => ['id' => $c->host->id, 'name' => $c->host->name, 'email' => $c->host->email],
            'messages' => $c->messages->map(fn ($m) => [
                'id' => $m->id,
                'body' => $m->body,
                'senderId' => $m->sender_id,
                'senderName' => $m->sender->name,
                'isMine' => $m->sender_id === $userId,
                'readAt' => $m->read_at?->toISOString(),
                'createdAt' => $m->created_at?->toISOString(),
            ])->all(),
            'createdAt' => $c->created_at?->toISOString(),
        ];
    }
}
