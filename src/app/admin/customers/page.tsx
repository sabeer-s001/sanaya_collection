"use client";

import React from "react";
import { useApp } from "@/context/AppContext";

export default function AdminCustomersPage() {
  const { users } = useApp();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">User Registry</h1>
        <p className="text-xs text-zinc-500 mt-1">Review accounts and role settings</p>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 font-bold uppercase tracking-wider text-[10px] text-zinc-600">
                <th className="p-4 border-r border-zinc-100">User Identity</th>
                <th className="p-4 border-r border-zinc-100">Email Address</th>
                <th className="p-4 border-r border-zinc-100">Addresses Stored</th>
                <th className="p-4">Security Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 font-medium">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="p-4 border-r border-zinc-100 flex items-center space-x-2 font-bold text-zinc-900">
                    <div className="w-6 h-6 bg-rose-50 text-rose-600 text-[10px] rounded-full flex items-center justify-center font-bold border border-rose-100">
                      {user.fullName ? user.fullName.charAt(0).toUpperCase() : "?"}
                    </div>
                    <span>{user.fullName}</span>
                  </td>
                  <td className="p-4 border-r border-zinc-100 text-zinc-600">{user.email}</td>
                  <td className="p-4 border-r border-zinc-100 text-zinc-500">{user.addresses ? user.addresses.length : 0} Profiles</td>
                  <td className="p-4">
                    <span className={`inline-block border px-2.5 py-1 text-[9px] font-bold rounded-lg uppercase tracking-wider ${
                      user.role === "admin" 
                        ? "bg-rose-50 text-rose-700 border-rose-200" 
                        : "bg-zinc-50 text-zinc-600 border-zinc-300"
                    }`}>
                      {user.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
