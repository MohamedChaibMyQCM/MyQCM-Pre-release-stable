#!/usr/bin/env python3
import argparse, csv, json, math, os
from datetime import datetime

def clamp01(x):
    return max(0.0, min(1.0, x))

def bkt_corrected(prev, correct, slip, guess, learn):
    pL0 = clamp01(prev); s = clamp01(slip); g = clamp01(guess); t = clamp01(learn)
    eps = 1e-12
    pC = pL0*(1 - s) + (1 - pL0)*g
    pI = pL0*s       + (1 - pL0)*(1 - g)
    post = (pL0*(1 - s))/max(eps, pC) if correct else (pL0*s)/max(eps, pI)
    return clamp01(post + (1 - post)*t)

def bkt_legacy(prev, correct, slip, guess, learn):
    p_learn_temp = prev + (1 - prev) * learn
    if correct:
        num = p_learn_temp * (1 - slip)
        den = num + (1 - p_learn_temp) * guess
    else:
        num = p_learn_temp * slip
        den = num + (1 - p_learn_temp) * (1 - guess)
    return clamp01(num / max(1e-12, den))

def log_loss(y_true, y_prob):
    s = 0.0; n = 0
    for t, p in zip(y_true, y_prob):
        if t is None or p is None: continue
        p = max(1e-12, min(1 - 1e-12, p))
        s += -(t*math.log(p) + (1 - t)*math.log(1 - p))
        n += 1
    return s / max(1, n)

def brier(y_true, y_prob):
    s = 0.0; n = 0
    for t, p in zip(y_true, y_prob):
        if t is None or p is None: continue
        s += (p - t)**2; n += 1
    return s / max(1, n)

def auc_approx(y_true, y_prob):
    pairs = [(p, t) for p, t in zip(y_prob, y_true) if t is not None and p is not None]
    pairs.sort(key=lambda x: x[0])
    pos = sum(1 for _, t in pairs if t == 1); neg = sum(1 for _, t in pairs if t == 0)
    if pos == 0 or neg == 0: return float('nan')
    rank = 0
    for i, (p, t) in enumerate(pairs, 1):
        if t == 1: rank += i
    return (rank - pos*(pos + 1)/2) / (pos*neg)

def ece(y_true, y_prob, bins=10):
    buckets = [[] for _ in range(bins)]
    for t, p in zip(y_true, y_prob):
        if t is None or p is None: continue
        b = min(bins - 1, int(p * bins))
        buckets[b].append((t, p))
    n = sum(len(b) for b in buckets); s = 0.0
    for b in buckets:
        if not b: continue
        acc = sum(t for t, _ in b) / len(b)
        conf = sum(p for _, p in b) / len(b)
        s += len(b)/n * abs(acc - conf)
    return s

def binarize(sr, thr=0.7):
    if sr is None: return None
    try:
        return 1 if float(sr) >= thr else 0
    except: return None

def load_attempts(p):
    rows = []
    with open(p, newline='', encoding='utf-8') as f:
        r = csv.DictReader(f)
        for d in r:
            rows.append({
                'user_id': d.get('user_id'),
                'session_id': d.get('session_id'),
                'item_id': d.get('item_id'),
                'course_id': d.get('course_id'),
                'difficulty': d.get('difficulty'),
                'correct': binarize(d.get('correct')),
                'timestamp': d.get('timestamp')
            })
    rows.sort(key=lambda x: (x['user_id'], x['timestamp']))
    return rows

def evaluate_bkt(seq, slip=0.1, guess=0.2, learn=0.3, corrected=True):
    y_true = []; y_prob = []
    state = {}
    for a in seq:
        uid = a['user_id']; correct = a['correct']
        if correct is None: continue
        prev = state.get(uid, 0.2)
        if corrected:
            pC = bkt_corrected(prev, True, slip, guess, learn)
        else:
            pC = bkt_legacy(prev, True, slip, guess, learn)
        y_true.append(correct); y_prob.append(pC)
        state[uid] = bkt_corrected(prev, bool(correct), slip, guess, learn) if corrected else bkt_legacy(prev, bool(correct), slip, guess, learn)
    return {
        'logloss': log_loss(y_true, y_prob),
        'brier': brier(y_true, y_prob),
        'auc': auc_approx(y_true, y_prob),
        'ece': ece(y_true, y_prob),
        'n': len(y_true),
    }

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--attempts', required=True)
    ap.add_argument('--items', required=True)
    ap.add_argument('--outdir', default='eval_out')
    ap.add_argument('--cohort', choices=['legacy','corrected'], required=True)
    args = ap.parse_args()

    os.makedirs(args.outdir, exist_ok=True)
    attempts = load_attempts(args.attempts)

    m_legacy = evaluate_bkt(attempts, corrected=False)
    m_corrected = evaluate_bkt(attempts, corrected=True)

    score_path = os.path.join(args.outdir, 'SCORECARD.csv')
    write_header = not os.path.exists(score_path)
    with open(score_path, 'a', encoding='utf-8', newline='') as f:
        w = csv.writer(f)
        if write_header:
            w.writerow(['Cohort','Model','Log-loss','Brier','AUC','ECE','N'])
        w.writerow([args.cohort,'Legacy-BKT', m_legacy['logloss'], m_legacy['brier'], m_legacy['auc'], m_legacy['ece'], m_legacy['n']])
        w.writerow([args.cohort,'Corrected-BKT', m_corrected['logloss'], m_corrected['brier'], m_corrected['auc'], m_corrected['ece'], m_corrected['n']])

    metrics_path = os.path.join(args.outdir, 'metrics.json')
    metrics = {}
    if os.path.exists(metrics_path):
        with open(metrics_path, 'r', encoding='utf-8') as f:
            try: metrics = json.load(f)
            except: metrics = {}
    metrics.setdefault('generated_at', datetime.utcnow().isoformat() + 'Z')
    metrics.setdefault('cohorts', {})
    metrics['cohorts'][args.cohort] = {
        'legacy': m_legacy,
        'corrected': m_corrected,
    }
    with open(metrics_path, 'w', encoding='utf-8') as f:
        json.dump(metrics, f, indent=2)
    print(f"Wrote {score_path} and {metrics_path}")

if __name__ == '__main__':
    main()

