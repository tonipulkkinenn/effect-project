import { cleanEnv, str } from "envalid";
import { Configuration } from "types";

const env = cleanEnv(import.meta.env, {
  VITE_API_KEY: str()
});

export default class Config {

  public static get = (): Configuration => ({
    apiKey: env.VITE_API_KEY
  });

}