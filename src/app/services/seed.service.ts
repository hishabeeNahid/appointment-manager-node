import bcrypt from "bcryptjs";
import prisma from "../../shared/db";

const seedDatabase = async () => {
  try {
    // Check if data already exists
    const existingUsers = await prisma.user.count();
    if (existingUsers > 0) {
      console.log("Database already seeded");
      return;
    }

    // Hash password for all users
    const hashedPassword = await bcrypt.hash("password123", 12);

    // Create sample doctors
    const doctors = [
      {
        name: "Dr. John Smith",
        email: "john.smith@example.com",
        password: hashedPassword,
        role: "DOCTOR" as const,
        specialization: "Cardiology",
        photo_url: "https://example.com/doctor1.jpg",
      },
      {
        name: "Dr. Sarah Johnson",
        email: "sarah.johnson@example.com",
        password: hashedPassword,
        role: "DOCTOR" as const,
        specialization: "Dermatology",
        photo_url: "https://example.com/doctor2.jpg",
      },
      {
        name: "Dr. Michael Brown",
        email: "michael.brown@example.com",
        password: hashedPassword,
        role: "DOCTOR" as const,
        specialization: "Neurology",
        photo_url: "https://example.com/doctor3.jpg",
      },
      {
        name: "Dr. Emily Davis",
        email: "emily.davis@example.com",
        password: hashedPassword,
        role: "DOCTOR" as const,
        specialization: "Pediatrics",
        photo_url: "https://example.com/doctor4.jpg",
      },
      {
        name: "Dr. Robert Wilson",
        email: "robert.wilson@example.com",
        password: hashedPassword,
        role: "DOCTOR" as const,
        specialization: "Orthopedics",
        photo_url: "https://example.com/doctor5.jpg",
      },
    ];

    // Create sample patients
    const patients = [
      {
        name: "Alice Johnson",
        email: "alice.johnson@example.com",
        password: hashedPassword,
        role: "PATIENT" as const,
        photo_url: "https://example.com/patient1.jpg",
      },
      {
        name: "Bob Smith",
        email: "bob.smith@example.com",
        password: hashedPassword,
        role: "PATIENT" as const,
        photo_url: "https://example.com/patient2.jpg",
      },
      {
        name: "Carol Davis",
        email: "carol.davis@example.com",
        password: hashedPassword,
        role: "PATIENT" as const,
        photo_url: "https://example.com/patient3.jpg",
      },
      {
        name: "David Wilson",
        email: "david.wilson@example.com",
        password: hashedPassword,
        role: "PATIENT" as const,
        photo_url: "https://example.com/patient4.jpg",
      },
      {
        name: "Eva Brown",
        email: "eva.brown@example.com",
        password: hashedPassword,
        role: "PATIENT" as const,
        photo_url: "https://example.com/patient5.jpg",
      },
    ];

    // Insert doctors and patients
    const createdDoctors = await prisma.user.createMany({
      data: doctors,
    });

    const createdPatients = await prisma.user.createMany({
      data: patients,
    });

    console.log(
      `Created ${createdDoctors.count} doctors and ${createdPatients.count} patients`
    );

    // Get created users for appointments
    const allDoctors = await prisma.user.findMany({
      where: { role: "DOCTOR" },
    });

    const allPatients = await prisma.user.findMany({
      where: { role: "PATIENT" },
    });

    // Create sample appointments
    const appointments = [
      {
        doctorId: allDoctors[0].id,
        patientId: allPatients[0].id,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        status: "PENDING" as const,
      },
      {
        doctorId: allDoctors[1].id,
        patientId: allPatients[1].id,
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
        status: "PENDING" as const,
      },
      {
        doctorId: allDoctors[2].id,
        patientId: allPatients[2].id,
        date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        status: "COMPLETED" as const,
      },
    ];

    const createdAppointments = await prisma.appointment.createMany({
      data: appointments,
    });

    console.log(`Created ${createdAppointments.count} appointments`);
    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
};

const SeedService = {
  seedDatabase,
};

export default SeedService;
