import java.util.Scanner;

public class Array {
	public static void main(String[] var0) {
		Scanner scan = new Scanner (System.in);

		System.out.print("Enter how many students: ");
		int stud = scan.nextInt();

		int info;

		for (int i = 1; i <= stud; i++){
		System.out.println("Enter the information on Student " + i);

		System.out.println("Name: ");
		String name = scan.nextLine();

		System.out.println("Age: ");
		int age = scan.nextInt();

		System.out.println("Course: ");
		String course = scan.nextLine();

		System.out.println("Prelim Grade: ");
		int prelim = scan.nextInt();

		System.out.println("Midtern Grade: ");
		int midterm = scan.nextInt();

		System.out.println("Final Grade: ");
		int final = scan.nextInt();
		}
        }
}