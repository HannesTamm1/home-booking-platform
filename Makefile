.PHONY: install dev seed test e2e reset

install:
	cd Backend && composer install
	cd Frontend && npm install

dev:
	@echo "Starting backend on :8000 and frontend on :3000..."
	@trap 'kill 0' SIGINT; \
	(cd Backend && php artisan serve --host=127.0.0.1 --port=8000) & \
	(cd Frontend && npm run dev) & \
	wait

seed:
	cd Backend && php artisan migrate:fresh --seed

reset: seed

test:
	cd Frontend && npm run type-check

e2e:
	cd Frontend && npm run test:e2e
