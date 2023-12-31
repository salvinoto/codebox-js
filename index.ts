import axios, { AxiosInstance } from "axios";
import settings from "./config";
import { v4 as uuidv4 } from 'uuid';

export class CodeBoxStatus {
  status: string;

  constructor(status: string) {
    this.status = status;
  }

  toString() {
    return this.status;
  }
}

export class CodeBoxOutput {
  type: string;
  content: string;

  constructor(type: string, content: string) {
    this.type = type;
    this.content = content;
  }

  toString() {
    return this.content;
  }
}

export class CodeBoxFile {
  name: string;
  content: string | null;

  constructor(name: string, content: string | null = null) {
    this.name = name;
    this.content = content;
  }

  toString() {
    return this.name;
  }
}

export class CodeBox {
  session_id: string | null;
  aiohttp_session: AxiosInstance | null;
  last_interaction: Date;

  constructor() {
    this.session_id = null;
    this.aiohttp_session = axios.create({
      baseURL: settings.CODEBOX_BASE_URL,
      timeout: settings.CODEBOX_TIMEOUT * 1000,
      headers: {
        Authorization: `Bearer ${settings.CODEBOX_API_KEY}`,
        // Add other headers as needed
      },
    });
    this.last_interaction = new Date();
  }

  private update() {
    this.last_interaction = new Date();
  }

  private async codeboxRequest(method: string, endpoint: string, body?: any) {
    this.update();
    if (this.session_id === null || this.aiohttp_session === null) {
      throw new Error("Make sure to start your CodeBox before using it.");
    }
    const response = await this.aiohttp_session({
      method: method,
      url: endpoint,
      data: body,
    });
    return response.data;
  }

  async start(): Promise<CodeBoxStatus> {
    if (this.session_id !== null) {
        console.log("CodeBox is already started!");
        return new CodeBoxStatus("started");
    }
    if (this.aiohttp_session === null) {
        throw new Error("aiohttp_session is null");
    }
    const response = await this.aiohttp_session.get(`/codebox/start`);
    this.session_id = uuidv4(response.data.id);
    console.log(this.session_id);
    console.log("CodeBox started!");
    return new CodeBoxStatus("started");
}

  async status() {
    const response = await this.codeboxRequest(
      "GET",
      `/codebox/${this.session_id}/`
    );
  }

  async run(code: string) {
    return this.codeboxRequest("POST", `/codebox/${this.session_id}/run`, {
      code: code,
    });
  }

  async upload(file_name: string, content: string) {
    return this.codeboxRequest("POST", `/codebox/${this.session_id}/upload`, {
      file: { file_name, content },
    });
  }

  async download(file_name: string) {
    return this.codeboxRequest("GET", `/codebox/${this.session_id}/download`, {
      file_name: file_name,
    });
  }

  async install(package_name: string) {
    return this.codeboxRequest("POST", `/codebox/${this.session_id}/install`, {
      package_name: package_name,
    });
  }

  async list_files() {
    const response = await this.codeboxRequest(
      "GET",
      `/codebox/${this.session_id}/files`
    );
    return response.files.map((file_name: string) => ({
      name: file_name,
      content: null,
    }));
  }

  async restart() {
    return this.codeboxRequest("POST", `/codebox/${this.session_id}/restart`);
  }

  async stop(): Promise<CodeBoxStatus> {
    if (this.session_id === null || this.aiohttp_session === null) {
      throw new Error("Make sure to start your CodeBox before using it.");
    }
    const response = await this.aiohttp_session.post(
      `/codebox/${this.session_id}/stop`
    );
    this.session_id = null;
    return response.data;
  }

  async cleanup() {
    if (this.aiohttp_session) {
      // Perform cleanup here...
      this.aiohttp_session = null;
    }
  }
}
