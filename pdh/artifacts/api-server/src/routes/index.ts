import { Router, type IRouter } from "express";
import healthRouter from "./health";
import mhraRouter from "./mhra";
import statusRouter from "./status";
import authRouter from "./auth";
import usersRouter from "./users";

const router: IRouter = Router();

router.use(healthRouter);
router.use(mhraRouter);
router.use(statusRouter);
router.use(authRouter);
router.use(usersRouter);

export default router;
