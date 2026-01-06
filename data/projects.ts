export interface Project {
    id: string;
    title: string;
    description: string;
    shortDescription: string;
    image: string;
    category: string;
    likes: number;
    team: string[];
    year: string;
}

export const projects: Project[] = [
    {
        id: "1",
        title: "Autonomous Delivery Drone",
        shortDescription: "A drone system that can navigate autonomously in urban environments to deliver small packages.",
        description: "This project focuses on building an autonomous delivery drone capable of navigating complex urban environments. It uses computer vision for obstacle avoidance and GPS for route planning. The drone is designed to deliver small medical supplies or packages to remote areas.",
        image: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?q=80&w=2070&auto=format&fit=crop",
        category: "Robotics",
        likes: 124,
        team: ["Ahmad Fauzi", "Siti Aminah", "Budi Santoso"],
        year: "2023"
    },
    {
        id: "2",
        title: "AI-Powered Crop Monitoring",
        shortDescription: "Uses satellite imagery and AI to monitor crop health and predict yields.",
        description: "AI-Powered Crop Monitoring is a system that leverages satellite imagery and machine learning to help farmers monitor the health of their crops. It can detect early signs of pest infestations, nutrient deficiencies, and water stress, providing actionable insights to optimize yield.",
        image: "https://images.unsplash.com/photo-1560493676-04071c5f467b?q=80&w=2074&auto=format&fit=crop",
        category: "Artificial Intelligence",
        likes: 89,
        team: ["Lia Pratama", "Rian Wijaya"],
        year: "2024"
    },
    {
        id: "3",
        title: "Smart Traffic Management",
        shortDescription: "A system that optimizes traffic flow using real-time data and AI.",
        description: "This project aims to reduce urban traffic congestion by using AI to optimize traffic signal timings. The system analyzes real-time traffic data from cameras and sensors to adjust flow dynamically, reducing wait times and carbon emissions.",
        image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        category: "Smart City",
        likes: 215,
        team: ["Dewi Lestari", "Kevin Hartono"],
        year: "2023"
    },
    {
        id: "4",
        title: "Underwater Explorer Bot",
        shortDescription: "An ROV designed for deep-sea exploration and marine life monitoring.",
        description: "The Underwater Explorer Bot is a Remotely Operated Vehicle (ROV) built for exploring deep-sea environments. It is equipped with specialized sensors and cameras to monitor marine life and collect data for environmental researchers.",
        image: "https://images.unsplash.com/photo-1585064222084-06c41495ada3?q=80&w=1398&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        category: "Robotics",
        likes: 56,
        team: ["Agus Susanto", "Maya Indah"],
        year: "2024"
    }
];
