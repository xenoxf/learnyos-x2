"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Settings, Bell, Shield, Palette, User, Trash2 } from "lucide-react";
import { apiService } from "@/services/apiService";
import { useToast } from "@/hooks/use-toast";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { toast } = useToast();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [loading, setLoading] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      await apiService.deleteUser();
      apiService.logout();
      toast({
        title: "Cuenta eliminada",
        description: "Tu cuenta ha sido eliminada permanentemente",
      });
      window.location.href = "/auth";
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full max-h-[90vh] bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 shadow-2xl overflow-y-auto">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-white">
                Configuración
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Personaliza tu experiencia de aprendizaje
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Separator className="bg-slate-700/50" />

        <Tabs defaultValue="general" className="w-full space-y-6">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-4 bg-slate-800/50 border border-slate-700/50 rounded-lg p-1">
            <TabsTrigger
              value="general"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white rounded-md transition-all text-xs sm:text-sm"
            >
              <User className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">General</span>
              <span className="sm:hidden">Gral</span>
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white rounded-md transition-all text-xs sm:text-sm"
            >
              <Bell className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Notificaciones</span>
              <span className="sm:hidden">Not</span>
            </TabsTrigger>
            <TabsTrigger
              value="appearance"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white rounded-md transition-all text-xs sm:text-sm"
            >
              <Palette className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Apariencia</span>
              <span className="sm:hidden">Apar</span>
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white rounded-md transition-all text-xs sm:text-sm"
            >
              <Shield className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Seguridad</span>
              <span className="sm:hidden">Seg</span>
            </TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general" className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Perfil</CardTitle>
                <CardDescription className="text-slate-400">
                  Información general de tu cuenta
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-200 font-semibold text-sm">
                    Nombre de usuario
                  </Label>
                  <input
                    type="text"
                    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 sm:px-4 py-2 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 focus:ring-4 transition-all text-sm"
                    placeholder="Tu nombre"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-200 font-semibold text-sm">
                    Correo electrónico
                  </Label>
                  <input
                    type="email"
                    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 sm:px-4 py-2 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 focus:ring-4 transition-all text-sm"
                    placeholder="tu@ejemplo.com"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">
                  Preferencias de Notificaciones
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-700/30 transition-colors">
                  <div className="flex-1">
                    <Label className="text-white font-semibold text-sm">
                      Recordatorios de estudio
                    </Label>
                    <p className="text-xs sm:text-sm text-slate-400">
                      Recibe notificaciones para estudiar
                    </p>
                  </div>
                  <Switch
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                    className="data-[state=checked]:bg-blue-500"
                  />
                </div>
                <Separator className="bg-slate-700/50" />
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-700/30 transition-colors">
                  <div className="flex-1">
                    <Label className="text-white font-semibold text-sm">
                      Notificaciones push
                    </Label>
                    <p className="text-xs sm:text-sm text-slate-400">
                      Notificaciones en tu dispositivo
                    </p>
                  </div>
                  <Switch
                    checked={pushNotifications}
                    onCheckedChange={setPushNotifications}
                    className="data-[state=checked]:bg-blue-500"
                  />
                </div>
                <Separator className="bg-slate-700/50" />
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-700/30 transition-colors">
                  <div className="flex-1">
                    <Label className="text-white font-semibold text-sm">
                      Resumen semanal
                    </Label>
                    <p className="text-xs sm:text-sm text-slate-400">
                      Recibe resumen de tu progreso
                    </p>
                  </div>
                  <Switch
                    checked={weeklyDigest}
                    onCheckedChange={setWeeklyDigest}
                    className="data-[state=checked]:bg-blue-500"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Tema</CardTitle>
                <CardDescription className="text-slate-400">
                  Personaliza la apariencia de la aplicación
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-700/30 transition-colors">
                  <div className="flex-1">
                    <Label className="text-white font-semibold text-sm">
                      Modo oscuro
                    </Label>
                    <p className="text-xs sm:text-sm text-slate-400">
                      Activar tema oscuro
                    </p>
                  </div>
                  <Switch
                    defaultChecked
                    className="data-[state=checked]:bg-blue-500"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Seguridad</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <Button className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold py-2 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl text-sm">
                  Cambiar Contraseña
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 font-semibold py-2 rounded-lg transition-all duration-300 text-sm"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar Cuenta
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {showDeleteConfirm ? (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-slate-800 p-6 rounded-lg shadow-lg max-w-sm w-full">
              <h3 className="text-white text-lg font-semibold mb-4">
                Confirmar Eliminación
              </h3>
              <p className="text-slate-400 text-sm mb-4">
                ¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se
                puede deshacer.
              </p>
              <div className="flex justify-end gap-2">
                <Button
                  onClick={handleDeleteAccount}
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300"
                >
                  {loading ? "Eliminando..." : "Eliminar Cuenta"}
                </Button>
                <Button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        <div className="flex gap-3 justify-end mt-6 flex-col-reverse sm:flex-row">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-slate-700/50 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg font-semibold px-6 text-sm"
          >
            Cancelar
          </Button>
          <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold rounded-lg px-6 shadow-xl hover:shadow-2xl transition-all duration-300 text-sm">
            Guardar Cambios
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}