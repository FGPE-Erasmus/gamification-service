xs = []
n = int(input())
while n != -1:
  xs.append(n)
  n = int(input())

def mean(xs):
  return sum(xs) / len(xs)

if __name__ == "__main__":
  print(round(mean(xs), 3))
