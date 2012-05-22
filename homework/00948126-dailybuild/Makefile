hello:hello.c
	@gcc hello.c -o hello

.PHONY: check clean
check:
	@./hello > hello.out
	@diff hello.correct hello.out
	@rm -f hello.out
clean:
	@rm -f hello

