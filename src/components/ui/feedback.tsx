import * as React from "react"
import { AlertCircle, Inbox, Loader2 } from "lucide-react"
import { Button } from "./button"
import { Card, CardContent } from "./card"
import { cn } from "@/lib/utils"

interface FeedbackStateProps {
    title: string
    description?: string
    className?: string
}

export function LoadingState({ title = "Carregando...", description, className }: FeedbackStateProps) {
    return (
        <div className={cn("flex min-h-[400px] flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500", className)}>
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <h3 className="mt-4 text-lg font-semibold">{title}</h3>
            {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
        </div>
    )
}

interface ErrorStateProps extends FeedbackStateProps {
    onRetry?: () => void
    retryText?: string
}

export function ErrorState({
    title = "Algo deu errado",
    description = "Não foi possível carregar os dados. Tente novamente em instantes.",
    onRetry,
    retryText = "Tentar novamente",
    className
}: ErrorStateProps) {
    return (
        <Card className={cn("mx-auto max-w-md border-destructive/20 bg-destructive/5", className)}>
            <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                <div className="rounded-full bg-destructive/10 p-3 text-destructive">
                    <AlertCircle className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{description}</p>
                {onRetry && (
                    <Button variant="outline" className="mt-6 border-destructive/20 hover:bg-destructive/10" onClick={onRetry}>
                        {retryText}
                    </Button>
                )}
            </CardContent>
        </Card>
    )
}

interface EmptyStateProps extends FeedbackStateProps {
    action?: React.ReactNode
    icon?: React.ReactNode
}

export function EmptyState({
    title = "Nenhum resultado encontrado",
    description,
    action,
    icon = <Inbox className="h-10 w-10 text-muted-foreground/50" />,
    className
}: EmptyStateProps) {
    return (
        <div className={cn("flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center animate-in fade-in zoom-in-95 duration-500", className)}>
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/50">
                {icon}
            </div>
            <h3 className="mt-4 text-lg font-semibold">{title}</h3>
            {description && <p className="mt-2 text-sm text-muted-foreground max-w-sm">{description}</p>}
            {action && <div className="mt-6">{action}</div>}
        </div>
    )
}
