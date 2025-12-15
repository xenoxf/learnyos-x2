// ==================== STORAGE UTILITIES ====================

export const StorageManager = {
  // ==================== TOKEN ====================

  /**
   * Guarda el token en localStorage
   * @param token - JWT token
   */
  setToken(token: string): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('auth_token', token);
    } catch (error) {
      console.error('Error al guardar token:', error);
    }
  },

  /**
   * Obtiene el token del localStorage
   */
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem('auth_token');
    } catch (error) {
      console.error('Error al obtener token:', error);
      return null;
    }
  },

  /**
   * Verifica si existe un token válido
   */
  hasToken(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      const token = localStorage.getItem('auth_token');
      return !!token && token.length > 0;
    } catch {
      return false;
    }
  },

  /**
   * Elimina el token de localStorage
   */
  removeToken(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem('auth_token');
    } catch (error) {
      console.error('Error al eliminar token:', error);
    }
  },

  // ==================== USER ====================

  /**
   * Guarda los datos del usuario en localStorage
   * @param user - Objeto usuario
   */
  setUser(user: any): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('auth_user', JSON.stringify(user));
    } catch (error) {
      console.error('Error al guardar usuario:', error);
    }
  },

  /**
   * Obtiene los datos del usuario del localStorage
   */
  getUser(): any {
    if (typeof window === 'undefined') return null;
    try {
      const user = localStorage.getItem('auth_user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      return null;
    }
  },

  /**
   * Actualiza datos específicos del usuario
   * @param updates - Datos a actualizar
   */
  updateUser(updates: Record<string, any>): void {
    try {
      const currentUser = StorageManager.getUser();
      if (currentUser) {
        const updatedUser = { ...currentUser, ...updates };
        StorageManager.setUser(updatedUser);
      }
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
    }
  },

  /**
   * Verifica si existe un usuario válido
   */
  hasUser(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      const user = localStorage.getItem('auth_user');
      if (!user) return false;
      const parsedUser = JSON.parse(user);
      return !!parsedUser && !!parsedUser.id && !!parsedUser.email;
    } catch {
      return false;
    }
  },

  /**
   * Obtiene el ID del usuario actual
   */
  getUserId(): number | null {
    try {
      const user = StorageManager.getUser();
      return user?.id ?? null;
    } catch {
      return null;
    }
  },

  /**
   * Obtiene el email del usuario actual
   */
  getUserEmail(): string | null {
    try {
      const user = StorageManager.getUser();
      return user?.email ?? null;
    } catch {
      return null;
    }
  },

  /**
   * Elimina los datos del usuario de localStorage
   */
  removeUser(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem('auth_user');
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
    }
  },

  // ==================== AUTHENTICATION ====================

  /**
   * Guarda token y usuario simultáneamente
   * @param token - JWT token
   * @param user - Datos del usuario
   */
  setAuth(token: string, user: any): void {
    try {
      StorageManager.setToken(token);
      StorageManager.setUser(user);
    } catch (error) {
      console.error('Error al guardar autenticación:', error);
    }
  },

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return StorageManager.hasToken() && StorageManager.hasUser();
  },

  /**
   * Obtiene la autenticación completa
   */
  getAuth(): { token: string | null; user: any } {
    return {
      token: StorageManager.getToken(),
      user: StorageManager.getUser(),
    };
  },

  /**
   * Limpia toda la autenticación
   */
  clearAuth(): void {
    try {
      StorageManager.removeToken();
      StorageManager.removeUser();
    } catch (error) {
      console.error('Error al limpiar autenticación:', error);
    }
  },

  // ==================== UTILITIES ====================

  /**
   * Limpia todo el localStorage
   */
  clearAll(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error al limpiar localStorage:', error);
    }
  },

  /**
   * Obtiene el tamaño aproximado del localStorage en bytes
   */
  getStorageSize(): number {
    if (typeof window === 'undefined') return 0;
    try {
      let size = 0;
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          size += localStorage[key].length + key.length;
        }
      }
      return size;
    } catch {
      return 0;
    }
  },

  /**
   * Verifica si el localStorage está disponible
   */
  isAvailable(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      const test = '__test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Exporta toda la autenticación como objeto
   */
  export(): { token: string | null; user: any } {
    return StorageManager.getAuth();
  },

  /**
   * Importa autenticación desde un objeto
   */
  import(data: { token: string; user: any }): void {
    if (data?.token && data?.user) {
      StorageManager.setAuth(data.token, data.user);
    }
  },
};