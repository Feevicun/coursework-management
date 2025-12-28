// components/TeacherProfileCard.tsx - оновлена версія
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TeacherProfileCardProps {
    title: string;
    children: React.ReactNode;
    onEdit?: () => void;
    actionButton?: React.ReactNode;
    className?: string;
}

export function TeacherProfileCard({ 
    title, 
    children, 
    onEdit, 
    actionButton,
    className
}: TeacherProfileCardProps) {
    return (
        <Card className={cn(
            "shadow-sm hover:shadow-md transition-shadow duration-200",
            // Мобільна адаптація
            "sm:border-x-0 sm:border-t-0 sm:rounded-none sm:shadow-none",
            className
        )}>
            <CardHeader className={cn(
                "flex flex-row items-center justify-between pb-3",
                // Мобільна адаптація
                "sm:px-4 sm:py-3"
            )}>
                <CardTitle className={cn(
                    "text-lg font-semibold",
                    // Мобільна адаптація
                    "sm:text-base"
                )}>
                    {title}
                </CardTitle>
                <div className="flex items-center gap-2">
                    {actionButton && actionButton}
                    {onEdit && (
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={onEdit} 
                            className={cn(
                                "h-8 w-8",
                                // Мобільна адаптація
                                "sm:h-7 sm:w-7"
                            )}
                        >
                            <Edit2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className={cn(
                // Мобільна адаптація
                "sm:px-4 sm:pt-0 sm:pb-4"
            )}>
                {children}
            </CardContent>
        </Card>
    );
};