#!/usr/bin/env python3
"""
Evaluation harness for MyQCM adaptive models (BKT / IRT / Baselines)

Usage examples:
  - From CSV files (recommended to start):
      python scripts/eval/run_eval.py --attempts attempts.csv --items items.csv --users users.csv \
        --outdir eval_out --plots

  - From Postgres (optional):
      python scripts/eval/run_eval.py --dsn postgresql://user:pass@host:5432/db --outdir eval_out

Outputs:
  - SCORECARD.csv
  - metrics.json
  - reliability plots (if --plots)

Notes:
  - Implements time-aware split per learner (70/15/15).
  - Provides baseline heuristics and simple BKT. IRT here is a minimal 1PL/2PL trainer sketch
    (for production, switch to a robust library or validated training routine).
"""

import argparse
import json
import math
import os
import random
from dataclasses import dataclass
from datetime import datetime
from typing import Dict, List, Optional, Tuple

import csv


# -------------------- Data Structures --------------------

@dataclass
class Attempt:
    user_id: str
    item_id: str
    ts: float  # timestamp (epoch seconds)
    success_ratio: Optional[float]
    course_id: Optional[str] = None
    type: Optional[str] = None  # qcm, qcs, qroc
    difficulty: Optional[str] = None  # easy, medium, hard


@dataclass
class Item:
    item_id: str
    difficulty: Optional[str]
    type: Optional[str]
    baseline: Optional[float]
    estimated_time: Optional[float]


# -------------------- Utils --------------------

def load_attempts_csv(path: str) -> List[Attempt]:
    rows = []
    with open(path, newline="", encoding="utf-8") as f:
        r = csv.DictReader(f)
        for d in r:
            ts = d.get("createdAt") or d.get("ts")
            try:
                tsv = float(ts) if ts and ts.replace(".", "", 1).isdigit() else datetime.fromisoformat(ts).timestamp()
            except Exception:
                continue
            sr = d.get("success_ratio")
            sr = float(sr) if sr not in (None, "", "null") else None
            rows.append(
                Attempt(
                    user_id=str(d.get("user_id") or d.get("user")),
                    item_id=str(d.get("mcq") or d.get("item_id")),
                    ts=tsv,
                    success_ratio=sr,
                    course_id=d.get("course") or d.get("course_id"),
                    type=d.get("type"),
                    difficulty=d.get("difficulty"),
                )
            )
    return rows


def load_items_csv(path: str) -> Dict[str, Item]:
    rows = {}
    with open(path, newline="", encoding="utf-8") as f:
        r = csv.DictReader(f)
        for d in r:
            iid = str(d.get("id") or d.get("item_id"))
            rows[iid] = Item(
                item_id=iid,
                difficulty=d.get("difficulty"),
                type=d.get("type"),
                baseline=float(d["baseline"]) if d.get("baseline") else None,
                estimated_time=float(d["estimated_time"]) if d.get("estimated_time") else None,
            )
    return rows


def binarize(sr: Optional[float], threshold: float = 0.7) -> Optional[int]:
    if sr is None:
        return None
    return 1 if sr >= threshold else 0


def time_aware_split(attempts: List[Attempt], ratios=(0.7, 0.15, 0.15)) -> Tuple[List[Attempt], List[Attempt], List[Attempt]]:
    by_user: Dict[str, List[Attempt]] = {}
    for a in attempts:
        by_user.setdefault(a.user_id, []).append(a)
    train, val, test = [], [], []
    for u, arr in by_user.items():
        arr.sort(key=lambda x: x.ts)
        n = len(arr)
        n_train = int(n * ratios[0])
        n_val = int(n * ratios[1])
        train += arr[:n_train]
        val += arr[n_train : n_train + n_val]
        test += arr[n_train + n_val :]
    return train, val, test


# -------------------- Metrics --------------------

def log_loss(y_true: List[int], y_prob: List[float], eps=1e-12) -> float:
    s = 0.0
    n = 0
    for t, p in zip(y_true, y_prob):
        if t is None or p is None:
            continue
        p = max(eps, min(1 - eps, p))
        s += -(t * math.log(p) + (1 - t) * math.log(1 - p))
        n += 1
    return s / max(1, n)


def brier(y_true: List[int], y_prob: List[float]) -> float:
    s = 0.0
    n = 0
    for t, p in zip(y_true, y_prob):
        if t is None or p is None:
            continue
        s += (p - t) ** 2
        n += 1
    return s / max(1, n)


def auc_approx(y_true: List[int], y_prob: List[float]) -> float:
    # Simple rank AUC; adequate for diagnostics
    pairs = [(p, t) for p, t in zip(y_prob, y_true) if t is not None and p is not None]
    pairs.sort(key=lambda x: x[0])
    pos = sum(1 for _, t in pairs if t == 1)
    neg = sum(1 for _, t in pairs if t == 0)
    if pos == 0 or neg == 0:
        return float("nan")
    rank = 0
    cum = 0
    for i, (p, t) in enumerate(pairs, 1):
        if t == 1:
            rank += i
    auc = (rank - pos * (pos + 1) / 2) / (pos * neg)
    return auc


def ece(y_true: List[int], y_prob: List[float], bins: int = 10) -> float:
    buckets = [[] for _ in range(bins)]
    for t, p in zip(y_true, y_prob):
        if t is None or p is None:
            continue
        b = min(bins - 1, int(p * bins))
        buckets[b].append((t, p))
    n = sum(len(b) for b in buckets)
    s = 0.0
    for b in buckets:
        if not b:
            continue
        acc = sum(t for t, _ in b) / len(b)
        conf = sum(p for _, p in b) / len(b)
        s += len(b) / n * abs(acc - conf)
    return s


# -------------------- Models (Baselines/BKT sketch) --------------------

class BaselineMovingAverage:
    def __init__(self, window: int = 5, threshold: float = 0.7):
        self.window = window
        self.threshold = threshold
        self.hist: Dict[str, List[int]] = {}

    def predict(self, a: Attempt) -> Optional[float]:
        h = self.hist.get(a.user_id, [])
        if not h:
            return 0.5
        k = h[-self.window :]
        return sum(k) / len(k)

    def update(self, a: Attempt):
        y = binarize(a.success_ratio, self.threshold)
        if y is None:
            return
        self.hist.setdefault(a.user_id, []).append(y)


class BKTOneSkill:
    def __init__(self, p_init=0.2, p_learn=0.3, p_slip=0.1, p_guess=0.2, threshold=0.7):
        self.p = {}
        self.p_init = p_init
        self.p_learn = p_learn
        self.p_slip = p_slip
        self.p_guess = p_guess
        self.threshold = threshold

    def predict(self, a: Attempt) -> float:
        return self.p.get((a.user_id, a.course_id), self.p_init)

    def update(self, a: Attempt):
        key = (a.user_id, a.course_id)
        p = self.p.get(key, self.p_init)
        y = binarize(a.success_ratio, self.threshold)
        if y is None:
            return
        if y == 1:
            num = p * (1 - self.p_slip)
            den = num + (1 - p) * self.p_guess
        else:
            num = p * self.p_slip
            den = num + (1 - p) * (1 - self.p_guess)
        post = num / max(1e-9, den)
        p_next = post + (1 - post) * self.p_learn
        self.p[key] = min(1.0, max(0.0, p_next))


# -------------------- Runner --------------------

def evaluate(model, seq: List[Attempt]) -> Dict[str, float]:
    y_true, y_prob = [], []
    for a in seq:
        y = binarize(a.success_ratio)
        p = model.predict(a)
        y_true.append(y)
        y_prob.append(p)
        model.update(a)
    return {
        "logloss": log_loss(y_true, y_prob),
        "brier": brier(y_true, y_prob),
        "auc": auc_approx(y_true, y_prob),
        "ece": ece(y_true, y_prob),
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--attempts", type=str, help="attempts CSV")
    ap.add_argument("--items", type=str, help="items CSV")
    ap.add_argument("--users", type=str, help="users CSV (optional)")
    ap.add_argument("--dsn", type=str, help="Postgres DSN (optional)")
    ap.add_argument("--outdir", type=str, default="eval_out")
    ap.add_argument("--plots", action="store_true")
    args = ap.parse_args()

    os.makedirs(args.outdir, exist_ok=True)

    # Load data (CSV path is the minimal starting point)
    if not args.attempts:
        raise SystemExit("Provide --attempts CSV for evaluation.")
    attempts = load_attempts_csv(args.attempts)
    attempts = [a for a in attempts if a.success_ratio is not None]

    # Split
    train, val, test = time_aware_split(attempts)

    # Baseline
    bl = BaselineMovingAverage()
    metrics_bl = evaluate(bl, list(train) + list(val) + list(test))

    # BKT only (one-skill per course)
    bkt = BKTOneSkill()
    metrics_bkt = evaluate(bkt, list(train) + list(val) + list(test))

    # TODO: IRT 1PL/2PL training — placeholder for now
    metrics_irt1 = {k: None for k in ["logloss", "brier", "auc", "ece"]}
    metrics_irt2 = {k: None for k in ["logloss", "brier", "auc", "ece"]}

    # Write outputs
    scorecard_path = os.path.join(args.outdir, "SCORECARD.csv")
    with open(scorecard_path, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["Model", "Log-loss", "Brier", "AUC", "ECE"])
        w.writerow(["Baseline-MA", metrics_bl["logloss"], metrics_bl["brier"], metrics_bl["auc"], metrics_bl["ece"]])
        w.writerow(["BKT-only", metrics_bkt["logloss"], metrics_bkt["brier"], metrics_bkt["auc"], metrics_bkt["ece"]])
        w.writerow(["IRT-1PL", metrics_irt1["logloss"], metrics_irt1["brier"], metrics_irt1["auc"], metrics_irt1["ece"]])
        w.writerow(["IRT-2PL", metrics_irt2["logloss"], metrics_irt2["brier"], metrics_irt2["auc"], metrics_irt2["ece"]])

    metrics_path = os.path.join(args.outdir, "metrics.json")
    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump({
            "generated_at": datetime.utcnow().isoformat() + "Z",
            "splits": {"n_train": len(train), "n_val": len(val), "n_test": len(test)},
            "models": {
                "Baseline-MA": metrics_bl,
                "BKT-only": metrics_bkt,
                "IRT-1PL": metrics_irt1,
                "IRT-2PL": metrics_irt2,
            }
        }, f, indent=2)

    print(f"Wrote {scorecard_path} and {metrics_path}")


if __name__ == "__main__":
    main()

