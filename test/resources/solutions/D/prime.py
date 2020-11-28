n = int(input())

def is_prime(n):
    if n < 2: 
         return False
    if n % 2 == 0:
         return n == 2
    k = 3
    while k*k <= n:
         if n % k == 0:
             return False
         k += 2
    return True

if __name__ == "__main__":
  if is_prime(n):
    print("yes")
  else:
    print("no")
