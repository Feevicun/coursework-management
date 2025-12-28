import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit2 } from "lucide-react";

interface StudentProfileCardProps {
    title: string;
    children: React.ReactNode;
    onEdit?: () => void;
    actionButton?: React.ReactNode;
}

export function StudentProfileCard({ 
    title, 
    children, 
    onEdit,
    actionButton 
}: StudentProfileCardProps) {
    return (
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-lg font-semibold text-foreground">{title}</CardTitle>
                <div className="flex items-center gap-2">
                    {actionButton}
                    {onEdit && (
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={onEdit} 
                            className="h-8 w-8 hover:bg-primary/10"
                        >
                            <Edit2 className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="pt-2">{children}</CardContent>
        </Card>
    );
}