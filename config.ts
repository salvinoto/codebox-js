import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

class CodeBoxSettings {
    VERBOSE: boolean;
    SHOW_INFO: boolean;
    CODEBOX_API_KEY: string | null;
    CODEBOX_BASE_URL: string;
    CODEBOX_TIMEOUT: number;

    constructor() {
        this.VERBOSE = process.env.VERBOSE === 'true';
        this.SHOW_INFO = process.env.SHOW_INFO === 'true';
        this.CODEBOX_API_KEY = process.env.CODEBOX_API_KEY || null;
        this.CODEBOX_BASE_URL = process.env.CODEBOX_BASE_URL || 'https://codeboxapi.com/api/v1';
        this.CODEBOX_TIMEOUT = Number(process.env.CODEBOX_TIMEOUT) || 20;
    }
}

const settings = new CodeBoxSettings();
export default settings;