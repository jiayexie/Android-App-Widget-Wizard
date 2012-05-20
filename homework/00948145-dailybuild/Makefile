hello:hello.c
	@gcc hello.c -o hello
	
.PHONY: check clean
check:
	@./hello > hello.ans
	@-diff hello.ans hello.correct
	@-rm -f hello.ans

clean:
	@-rm -f hello *.o
