import axios from "axios";
import CryptoJS from "crypto-js";
import type { GroupPayload } from "@/types/group";

export default class ApiService {
  static BASE_URL = "http://localhost:5050/api";
  static ENCRYPTION_KEY = "phegon-dev-inventory";

  // Encrypt data using CryptoJS
  static encrypt(data: string): string {
    return CryptoJS.AES.encrypt(data, this.ENCRYPTION_KEY).toString();
  }

  // Decrypt data using CryptoJS
  static decrypt(data: string): string {
    const bytes = CryptoJS.AES.decrypt(data, this.ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  // Save token with encryption
  static saveToken(token: string): void {
    const encryptedToken = this.encrypt(token);
    localStorage.setItem("token", encryptedToken);
  }

  // Retrieve the token
  static getToken(): string | null {
    const encryptedToken = localStorage.getItem("token");
    if (!encryptedToken) return null;
    return this.decrypt(encryptedToken);
  }

  // Save role with encryption
  static saveRole(role: string): void {
    const encryptedRole = this.encrypt(role);
    localStorage.setItem("role", encryptedRole);
  }

  // Retrieve the role
  static getRole(): string | null {
    const encryptedRole = localStorage.getItem("role");
    if (!encryptedRole) return null;
    return this.decrypt(encryptedRole);
  }

  static clearAuth(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
  }

  static getHeader() {
    const token = this.getToken();
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }

  /** AUTH && USERS API */
  static async registerUser(registerData: any) {
    const response = await axios.post(
      `${this.BASE_URL}/auth/register`,
      registerData
    );
    return response.data;
  }

  static async loginUser(loginData: any) {
    const response = await axios.post(
      `${this.BASE_URL}/auth/login`,
      loginData
    );
    return response.data;
  }

  static async getAllUsers() {
    const response = await axios.get(`${this.BASE_URL}/users/all`, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  static async getLoggedInUserInfo() {
    const response = await axios.get(`${this.BASE_URL}/users/current`, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  static async getUserById(userId: string) {
    const response = await axios.get(`${this.BASE_URL}/users/${userId}`, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  static async updateUser(userId: string, userData: any) {
    const response = await axios.put(
      `${this.BASE_URL}/users/update/${userId}`,
      userData,
      {
        headers: this.getHeader(),
      }
    );
    return response.data;
  }

  static async deleteUser(userId: string) {
    const response = await axios.delete(
      `${this.BASE_URL}/users/update/${userId}`,
      {
        headers: this.getHeader(),
      }
    );
    return response.data;
  }

  /** GROUPS API */
  static async createGroup(groupData: GroupPayload) {
    const response = await axios.post(`${this.BASE_URL}/groups/add`, groupData, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  static async getAllGroups() {
    const response = await axios.get(`${this.BASE_URL}/groups/all`, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  static async getGroupById(groupId: string | number) {
    const response = await axios.get(`${this.BASE_URL}/groups/${groupId}`, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  static async updateGroup(groupId: string | number, groupData: GroupPayload) {
    const response = await axios.put(
      `${this.BASE_URL}/groups/update/${groupId}`,
      groupData,
      {
        headers: this.getHeader(),
      }
    );
    return response.data;
  }

  static async deleteGroup(groupId: string | number) {
    const response = await axios.delete(
      `${this.BASE_URL}/groups/delete/${groupId}`,
      {
        headers: this.getHeader(),
      }
    );
    return response.data;
  }

  static getErrorMessage(error: unknown, fallback = "Something went wrong"): string {
    const err = error as { response?: { data?: { message?: string } } };
    if (!err?.response) {
      return `Couldn’t reach the NextSteps API at ${this.BASE_URL.replace(/\/api$/, "")}. Make sure the backend is running.`;
    }
    return err.response?.data?.message || fallback;
  }

  static getErrorStatus(error: unknown): number | undefined {
    return (error as { response?: { status?: number } })?.response?.status;
  }

  /** AUTHENTICATION CHECKER */
  static logout(): void {
    this.clearAuth();
  }

  static isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
  }

  static isAdmin(): boolean {
    const role = this.getRole();
    return role === "ADMIN";
  }

  static isDreamTeamLeader(): boolean {
    const role = this.getRole();
    return role === "DREAM_TEAM_LEADER";
  }
}
