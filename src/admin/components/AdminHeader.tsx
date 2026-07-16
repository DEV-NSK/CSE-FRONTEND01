import React from 'react'
import { Bell, Search, Plus, UserCircle } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'

export function AdminHeader() {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search..." 
            className="pl-9 bg-slate-50 border-slate-200 focus-visible:ring-slate-500"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Button size="sm" variant="default">
          <Plus className="h-4 w-4 mr-2" />
          Create
        </Button>
        <Button size="icon" variant="ghost" className="relative">
          <Bell className="h-5 w-5 text-slate-600" />
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-rose-500 rounded-full text-xs text-white flex items-center justify-center">
            3
          </span>
        </Button>
        <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
          <Avatar className="h-9 w-9">
            <AvatarImage src="" alt="Admin" />
            <AvatarFallback className="bg-blue-600 text-white">AD</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
