import java.util.*;

public class Mean {
  private static final Scanner IN = new Scanner(System.in);

  public static void main(String[] args) {
    
    List<Integer> nums = new ArrayList<>();
    int num;
    while ((num = IN.nextInt()) != -1) {
      nums.add(num);
    }
    double result = avg(nums.parallelStream().mapToInt(i -> i).toArray());
    System.out.println(String.format(Locale.US, "%.3f", result).replaceAll("0+$", "0").replaceAll("(\\.[1-9]+)0$", "$1"));
  }

  public static double avg(int[] nums) {
    int sum = 0, count = 0;
    for (int i = 0; i < nums.length; i++) {
      sum += nums[i];
      count++;
    }
    return (double) sum / count;
  }
}

 



 

  
  
