<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HostConnectController extends Controller
{
    /** Return current Connect status. */
    public function status(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'data' => [
                'connectId' => $user->stripe_connect_id,
                'complete' => $user->connect_onboarding_complete,
            ],
        ]);
    }

    /**
     * Stub: in a real app this would create a Stripe Connect account and return an onboarding URL.
     * For the demo we immediately mark the account as complete.
     */
    public function startOnboarding(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user->stripe_connect_id) {
            $user->update([
                'stripe_connect_id' => 'acct_demo_' . substr(md5($user->id . 'demo'), 0, 16),
                'connect_onboarding_complete' => true,
            ]);
        }

        return response()->json([
            'message' => 'Connect account set up (demo mode — no real Stripe call).',
            'data' => [
                'connectId' => $user->stripe_connect_id,
                'complete' => $user->connect_onboarding_complete,
                'onboardingUrl' => null,
            ],
        ]);
    }
}
