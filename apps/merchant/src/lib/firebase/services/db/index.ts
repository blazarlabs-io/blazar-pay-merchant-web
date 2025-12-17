import { transaction } from "./transaction";
import { user } from "./user";
import { trigger } from "./trigger";

const db: any = {};

db.user = user;
db.transaction = transaction;
db.trigger = trigger;

export { db };
