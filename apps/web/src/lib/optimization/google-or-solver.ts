import { spawn } from "node:child_process";
import * as path from "node:path";
import {
  solveVrpHeuristic,
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
    return solveVrpHeuristic(problem);
  }

  // Resolve path to vrp_solver.py inside packages/ai-engine
  const solverScriptPath = path.resolve(
    process.cwd(),
    "packages/ai-engine/src/or-tools/vrp_solver.py",
  );

  return new Promise<VrpSolution>((resolve) => {
    try {
      const pythonProcess = spawn("python3", [solverScriptPath], {
        stdio: ["pipe", "pipe", "pipe"],
      });

      let stdoutData = "";
      let _stderrData = "";

      pythonProcess.stdout.on("data", (chunk: Buffer | string) => {
        stdoutData += chunk.toString();
      });

      pythonProcess.stderr.on("data", (chunk: Buffer | string) => {
        _stderrData += chunk.toString();
      });

      pythonProcess.on("close", (code: number | null) => {
        if (code === 0 && stdoutData.trim()) {
          try {
            const parsed = JSON.parse(stdoutData) as VrpSolution;
            resolve(parsed);
            return;
          } catch (_err) {
            // fallback
          }
        }
        // Fallback to deterministic heuristic if Python execution had non-zero exit or unparseable JSON
        resolve(solveVrpHeuristic(problem));
      });

      pythonProcess.on("error", () => {
        resolve(solveVrpHeuristic(problem));
      });

      pythonProcess.stdin.write(JSON.stringify(problem));
      pythonProcess.stdin.end();
    } catch (_err) {
      resolve(solveVrpHeuristic(problem));
    }
  });
}
