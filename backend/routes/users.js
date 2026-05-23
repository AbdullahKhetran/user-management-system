import express from "express";
import { filterByEamil, users, switchAcitveStatus} from "../controllers/user.controller.js";

const router = express.Router();

router.route("/").get(users)
router.route("/by-email/:email").get(filterByEamil)
router.route("/:id/status").patch(switchAcitveStatus)

export default router;