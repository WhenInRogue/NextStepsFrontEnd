import axios from "axios";
import CryptoJS from "crypto-js";
import type { GroupPayload } from "@/types/group";
import type { MembershipPayload } from "@/types/membership";
import type { TestPayload } from "@/types/test";
import type { CategoryPayload, CategoryType } from "@/types/category";
import type { QuestionPayload } from "@/types/question";
import type { UserPayload } from "@/types/user";

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

  static async updateUser(userId: string | number, userData: UserPayload) {
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

  /** GROUP MEMBERSHIPS API */
  static async addMember(groupId: string | number, payload: MembershipPayload) {
    const response = await axios.post(
      `${this.BASE_URL}/groups/${groupId}/addmember`,
      payload,
      { headers: this.getHeader() },
    );
    return response.data;
  }

  static async getMembersByGroup(groupId: string | number) {
    const response = await axios.get(`${this.BASE_URL}/groups/${groupId}/members`, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  static async getMembershipsByUser(userId: string | number) {
    const response = await axios.get(`${this.BASE_URL}/users/${userId}/memberships`, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  static async updateMembership(membershipId: string | number, payload: MembershipPayload) {
    const response = await axios.put(
      `${this.BASE_URL}/memberships/${membershipId}`,
      payload,
      { headers: this.getHeader() },
    );
    return response.data;
  }

  static async removeMember(membershipId: string | number) {
    const response = await axios.put(
      `${this.BASE_URL}/memberships/${membershipId}/remove`,
      {},
      { headers: this.getHeader() },
    );
    return response.data;
  }

  /** TESTS API */
  static async createTest(testData: TestPayload) {
    const response = await axios.post(`${this.BASE_URL}/tests/add`, testData, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  static async getAllTests() {
    const response = await axios.get(`${this.BASE_URL}/tests/all`, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  static async getTestById(testId: string | number) {
    const response = await axios.get(`${this.BASE_URL}/tests/${testId}`, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  static async updateTest(testId: string | number, testData: TestPayload) {
    const response = await axios.put(`${this.BASE_URL}/tests/update/${testId}`, testData, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  static async deleteTest(testId: string | number) {
    const response = await axios.delete(`${this.BASE_URL}/tests/delete/${testId}`, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  /** CATEGORIES API */
  static async createCategory(payload: CategoryPayload) {
    const response = await axios.post(`${this.BASE_URL}/categories/add`, payload, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  static async getAllCategories() {
    const response = await axios.get(`${this.BASE_URL}/categories/all`, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  static async getCategoriesByType(categoryType: CategoryType) {
    const response = await axios.get(`${this.BASE_URL}/categories/type/${categoryType}`, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  static async getCategoryById(categoryId: string | number) {
    const response = await axios.get(`${this.BASE_URL}/categories/${categoryId}`, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  static async updateCategory(categoryId: string | number, payload: CategoryPayload) {
    const response = await axios.put(`${this.BASE_URL}/categories/update/${categoryId}`, payload, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  static async deleteCategory(categoryId: string | number) {
    const response = await axios.delete(`${this.BASE_URL}/categories/delete/${categoryId}`, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  /** QUESTIONS API */
  static async createQuestion(testId: string | number, payload: QuestionPayload) {
    const response = await axios.post(`${this.BASE_URL}/tests/${testId}/addquestion`, payload, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  static async getQuestionsByTest(testId: string | number) {
    const response = await axios.get(`${this.BASE_URL}/tests/${testId}/questions`, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  static async getQuestionById(questionId: string | number) {
    const response = await axios.get(`${this.BASE_URL}/questions/${questionId}`, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  static async updateQuestion(questionId: string | number, payload: QuestionPayload) {
    const response = await axios.put(`${this.BASE_URL}/questions/update/${questionId}`, payload, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  static async deleteQuestion(questionId: string | number) {
    const response = await axios.delete(`${this.BASE_URL}/questions/delete/${questionId}`, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  /** TAKE TEST / RESULTS API */
  static async takeTest(testId: string | number) {
    const response = await axios.post(
      `${this.BASE_URL}/tests/${testId}/take`,
      {},
      { headers: this.getHeader() },
    );
    return response.data;
  }

  static async submitTest(testResultId: string | number) {
    const response = await axios.post(
      `${this.BASE_URL}/tests/submit/${testResultId}`,
      {},
      { headers: this.getHeader() },
    );
    return response.data;
  }

  static async getCurrentUserTestResults() {
    const response = await axios.get(`${this.BASE_URL}/test-results/current`, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  static async getTestResultsByUser(userId: string | number) {
    const response = await axios.get(`${this.BASE_URL}/test-results/user/${userId}`, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  static async getTestResultById(testResultId: string | number) {
    const response = await axios.get(`${this.BASE_URL}/test-results/${testResultId}`, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  static async saveAnswer(testResultId: string | number, payload: AnswerPayload) {
    const response = await axios.post(`${this.BASE_URL}/test-results/${testResultId}/answer`, payload, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  static async getAnswersByTestResult(testResultId: string | number) {
    const response = await axios.get(`${this.BASE_URL}/test-results/${testResultId}/answers`, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  static async getScoresByTestResult(testResultId: string | number) {
    const response = await axios.get(`${this.BASE_URL}/test-results/${testResultId}/scores`, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  static async getScoresByUser(userId: string | number) {
    const response = await axios.get(`${this.BASE_URL}/users/${userId}/category-scores`, {
      headers: this.getHeader(),
    });
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

  static canViewGroupRoster(): boolean {
    return this.isAdmin() || this.isDreamTeamLeader();
  }
}
