import {buildTrustificationEnv} from "./environment";

// @ts-expect-error - this is a global variable loaded before the app
export const ENV = buildTrustificationEnv(window._env);

export default ENV;
