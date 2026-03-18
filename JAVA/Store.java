import java.util.Scanner;

public class Store{
	class Order{
	String name;
	int quan;
}

	public static void main(String[] args){
	Scanner scan = new Scanner (System.in);
	
	System.out.println("Code          | Product         | Price           ");
	System.out.println("1                | Laptop           | 45000         ");
	System.out.println("2                | Smartphone   | 20000       ");
	System.out.println("3                | Headphone    | 1500          ");
	System.out.println("4                | Keyboard       | 800              ");
	
	System.out.println("Enter how many customers");
	int many = scan.nextInt();
	
	Order customers = new Order();

	for (int i = 0; i < many; i++){
		System.out.println("Enter the customers name: ");
		customers.name = scan.nextLine();
		System.out.println("Enter the product of your order: ");
		int cho = scan.nextInt();
		System.out.println("How many: ");
		customers.quan = scan.nextInt();
		int total;

			switch(cho){
				case 1:	
					System.out.println("You ordered a Laptop. That is 45,000");
					System.out.println("Quantity: " + quan);
					total = 45000 * quan;
				break;
				case 2:
					System.out.println("You ordered a Smartphone. That is 20,000");
					System.out.println("Quantity: " + quan);
					total = 20000 * quan;
				break;
				case 3: 
					System.out.println("You ordered a Headphone. That is 1,500");
					System.out.println("Quantity: " + quan);
					total = 1500 * quan;
				break;
				case 4:
					System.out.println("You ordered a Keyboard. That is 800");
					System.out.println("Quantity: " + quan);
					total = 800 * quan;
				break;
			}
		if (total >= 50000){
			
		} if else (total >= 20000){

		} else {

		}
		
	}
	}
}