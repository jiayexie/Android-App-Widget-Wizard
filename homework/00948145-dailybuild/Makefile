hello:hello.c
	@gcc hello.c -o hello
	
.PHONY: check clean dist
check:
	@./hello > hello.ans
	@-diff hello.correct hello.ans
	@-rm -f hello.ans

clean:
	@-rm -f hello *.o

dist:
	@tar -zcf hello.tar.gz --exclude hello.tar.gz .
