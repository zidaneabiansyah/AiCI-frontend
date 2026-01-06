export interface Achievement {
    id: string;
    title: string;
    description: string;
    date: string;
    category: "Competition" | "Recognition" | "Partnership";
    image: string;
    link?: string;
}

export const achievements: Achievement[] = [
    {
        id: "1",
        title: "1st Winner - National Robotics Competition 2023",
        description: "Our team won first place in the National Robotics Competition organized by the Ministry of Education, Culture, Research, and Technology.",
        date: "October 2023",
        category: "Competition",
        image: "https://images.unsplash.com/photo-1561736778-92e52a7769ef?q=80&w=2070&auto=format&fit=crop"
    },
    {
        id: "2",
        title: "Partnership with UMG IdeaLab",
        description: "AiCi officially partnered with UMG IdeaLab to accelerate AI and robotics education in Indonesia.",
        date: "January 2024",
        category: "Partnership",
        image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070&auto=format&fit=crop"
    },
    {
        id: "3",
        title: "Outstanding AI Research Center Award",
        description: "AiCi recognized as the most innovative AI research center in the 2023 Tech Excellence Awards.",
        date: "December 2023",
        category: "Recognition",
        image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=2071&auto=format&fit=crop"
    },
    {
        id: "4",
        title: "Gold Medal - International Invention Fair 2024",
        description: "Our students' project 'Self-Driving Cart' received a Gold Medal at the International Invention Fair in Geneva.",
        date: "March 2024",
        category: "Competition",
        image: "https://images.unsplash.com/photo-1706374503312-7a4a4c030d2d?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    }
];
