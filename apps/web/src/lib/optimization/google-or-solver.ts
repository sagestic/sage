import { spawn } from "node:child_process";
import * as path from "node:path";
import {
  requireValidVrpSolution,
  type VrpProblemRequest,
  type VrpSolution,
} from "@sage/ai-engine";

/**
 * Executes the Google OR-Tools Python solver (vrp_solver.py)
 * for solving the Capacitated Vehicle Routing Problem (CVRP) with Pickup and Delivery.
 */
export async function solveVrpWithGoogleOrTools(
  problem: VrpProblemRequest,
): Promise<VrpSolution> {
  if (!problem.vehicles.length || !problem.deliveries.length) {
    throw new Error("VRP requires vehicles and deliveries");
  }

  // Resolve path to vrp_solver.py inside packages/ai-engine
  const solverScriptPath = path.resolve(process.cwd(), "packages/ai-engine/src/or-tools/vrp_solver.py");

  return new Promise<VrpSolution>((resolve, reject) => {
    try {
      const pythonProcess = spawn("python3", [solverScriptPath], {
        stdio: ["pipe", "pipe", "pipe"],
      });

      let stdoutData = "";
      let stderrData = "";
      let settled = false;
      const timeout = setTimeout(() => pythonProcess.kill("SIGKILL"), 8000);

      pythonProcess.stdout.on("data", (chunk: Buffer | string) => {
        stdoutData += chunk.toString();
        if (stdoutData.length > 2_000_000) pythonProcess.kill("SIGKILL");
      });

      pythonProcess.stderr.on("data", (chunk: Buffer | string) => {
        stderrData += chunk.toString().slice(0, 2000);
      });

      pythonProcess.on("close", (code: number | null) => {
        clearTimeout(timeout);
        if (settled) return;
        settled = true;
        if (code === 0 && stdoutData.trim()) {
          try {
            const parsed = JSON.parse(stdoutData) as unknown;
            resolve(requireValidVrpSolution(problem, parsed));
            return;
          } catch (err) {
            reject(err);
            return;
          }
        }
        reject(new Error(`VRP solver exited with code ${code}: ${stderrData.slice(0, 200)}`));
      });

      pythonProcess.on("error", (err) => {
        clearTimeout(timeout);
        if (!settled) { settled = true; reject(err); }
      });

      pythonProcess.stdin.write(JSON.stringify(problem));
      pythonProcess.stdin.end();
    } catch (err) {
      reject(err);
    }
  });
}
