import axios, { AxiosInstance } from 'axios';

interface CodeBoxStatus {
    status: string;
}

interface CodeBoxOutput {
    // Define the properties of CodeBoxOutput here
}

interface CodeBoxFile {
    name: string;
    content: string | null;
}

class CodeBox {
    session_id: string | null;
    aiohttp_session: AxiosInstance | null;
    last_interaction: Date;

    constructor() {
        this.session_id = null;
        this.aiohttp_session = axios.create();
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
            url: `/codebox/${this.session_id}` + endpoint,
            data: body
        });
        return response.data;
    }

    async start(): Promise<CodeBoxStatus> {
        if (this.session_id !== null) {
            console.log("CodeBox is already started!");
            return { status: "started" };
        }
        if (this.aiohttp_session === null) {
            throw new Error("aiohttp_session is null");
        }
        const response = await this.aiohttp_session.get("/codebox/start");
        this.session_id = response.data.id;
        console.log("CodeBox started!");
        return { status: "started" };
    }

    async status() {
        return this.codeboxRequest("GET", "/");
    }

    async run(code: string) {
        return this.codeboxRequest("POST", "/run", { code: code });
    }

    async upload(file_name: string, content: string) {
        return this.codeboxRequest("POST", "/upload", { file: { file_name, content } });
    }

    async download(file_name: string) {
        return this.codeboxRequest("GET", "/download", { file_name: file_name });
    }

    async install(package_name: string) {
        return this.codeboxRequest("POST", "/install", { package_name: package_name });
    }

    async list_files() {
        const response = await this.codeboxRequest("GET", "/files");
        return response.files.map((file_name: string) => ({ name: file_name, content: null }));
    }

    async restart() {
        return this.codeboxRequest("POST", "/restart");
    }

    async stop(): Promise<CodeBoxStatus> {
        if (this.session_id === null || this.aiohttp_session === null) {
            throw new Error("Make sure to start your CodeBox before using it.");
        }
        const response = await this.aiohttp_session.post(`/codebox/${this.session_id}/stop`);
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