'use client'

import { useState } from 'react'
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Bug } from 'lucide-react'
import { devClearRateLimit, devClearAllRateLimits } from '@/core/api/auth/signin/actions'

export function DevDrawer() {
    const [isOpen, setIsOpen] = useState(false)
    const [identifier, setIdentifier] = useState('')
    const [isClearing, setIsClearing] = useState(false)

    // Only show in development
    if (process.env.NODE_ENV !== 'development') {
        return null
    }

    const handleClear = async () => {
        if (!identifier.trim()) {
            toast.error('Please enter an identifier')
            return
        }
        setIsClearing(true)
        try {
            const result = await devClearRateLimit(identifier)
            toast.success(result.message)
            setIdentifier('')
        } catch (error) {
            toast.error(`Failed to clear rate limit: ${error}`)
        } finally {
            setIsClearing(false)
        }
    }

    const handleClearAll = async () => {
        setIsClearing(true)
        try {
            const result = await devClearAllRateLimits()
            toast.success(result.message)
        } catch (error) {
            toast.error(`Failed to clear all rate limits: ${error}`)
        } finally {
            setIsClearing(false)
        }
    }

    return (
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
            <DrawerTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    className="fixed top-4 left-4 z-50 rounded-full shadow-lg"
                >
                    <Bug className="h-5 w-5" />
                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>Dev Tools</DrawerTitle>
                    <DrawerDescription>Development-only tools</DrawerDescription>
                </DrawerHeader>
                <div className="p-4 space-y-4">
                    <div className="space-y-2">
                        <Label>Clear Rate Limit</Label>
                        <div className="flex gap-2">
                            <Input
                                placeholder="e.g., signin:192.168.1.1"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleClear()}
                            />
                            <Button onClick={handleClear} disabled={isClearing || !identifier.trim()}>
                                Clear
                            </Button>
                        </div>
                    </div>
                    <Button onClick={handleClearAll} disabled={isClearing} variant="destructive" className="w-full">
                        Clear All Rate Limits
                    </Button>
                </div>
                <DrawerFooter>
                    <DrawerClose asChild>
                        <Button variant="outline">Close</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}