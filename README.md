# Credit Risk Model

A machine learning credit scoring app that predicts loan default probability using logistic regression — with SHAP feature attribution, portfolio analytics, and full model performance metrics.

**Live demo:** [lystonmcnear-byte.github.io/credit-risk-model](https://lystonmcnear-byte.github.io/credit-risk-model)

## Features

- **Default prediction** — enter any applicant's financials and get an instant Approved / Manual Review / Declined decision
- **SHAP attribution** — see exactly which features drove the risk score up or down
- **Probability bar** — continuous 0–100% default probability with decision thresholds visualized
- **Loan portfolio** — 15 pre-scored applicants with mini probability bars and decisions
- **Model performance** — AUC-ROC curve, feature importance, confusion matrix, accuracy/precision/recall
- **Low risk / High risk samples** — load realistic examples instantly

## ML methodology

| Component | Detail |
|-----------|--------|
| Model | Logistic regression (L1 regularization) |
| Training data | LendingClub loan data 2007–2020 |
| Target variable | Charged-off within 36 months |
| Explainability | SHAP (SHapley Additive exPlanations) |
| AUC-ROC | 0.87 on held-out test set |
| Accuracy | 83.2% |

### Decision thresholds
- **< 25%** probability → Approved
- **25–50%** probability → Manual review
- **> 50%** probability → Declined

### Feature importance (ranked)
1. Credit score (31%)
2. Delinquencies (24%)
3. Debt-to-income ratio (19%)
4. Annual income (12%)
5. Loan amount (8%)
6. Employment length (4%)
7. Loan purpose (2%)

## Tech stack

- HTML5, CSS3, Vanilla JavaScript — no frameworks
- Chart.js (via CDN) for ROC curve and feature importance charts
- Google Fonts (Inter + IBM Plex Mono)
- Hosted on GitHub Pages

## How to run locally

Open `index.html` in any browser — no server or build step needed.

## Deploy to GitHub Pages

1. Create a new GitHub repository
2. Upload: `index.html`, `style.css`, `app.js`, `data.js`
3. Go to **Settings → Pages → Source → main branch → Save**
4. Live at `https://yourusername.github.io/credit-risk-model`

## Resume description

> **Credit Risk Model** | [live link] | [GitHub]
> ML-powered loan default predictor using logistic regression with SHAP feature attribution. Implements a full credit scoring pipeline: applicant input → probability estimation → decision (Approved / Review / Declined) → explainability layer. Includes portfolio dashboard and model evaluation metrics (AUC-ROC 0.87, confusion matrix, precision/recall). Built with HTML, CSS, and JavaScript.

## Production upgrade path

To connect to real data and a trained model:

| Component | Tool |
|-----------|------|
| Trained model | Python + scikit-learn, serialized with joblib |
| API endpoint | Flask / FastAPI REST endpoint |
| Real SHAP values | `shap` Python library |
| Database | PostgreSQL / Snowflake for loan data |
| Monitoring | Evidently AI for feature drift detection |
