import {register} from "../app/register";
import reducer from "./relationship-reducer";
export {selectRelated} from "./relationship-reducer";
export * from "./relationship-action";

register({
    "reducer": reducer.reducer,
    "name": reducer.name,
});
