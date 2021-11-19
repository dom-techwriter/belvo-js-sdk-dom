import nock from 'nock';
import { APIMocker, newSession } from './fixtures';
import RiskInsights from '../src/risk_insights';

const linkId = '0f58f366-55ea-48f2-82da-6afdfeeaed4d';

const riskInsightsResp = {
  "id": "17db71f7-1d2a-4ee1-8b9c-bf8ce6bc6a86",
  "link": "0f58f366-55ea-48f2-82da-6afdfeeaed4d",
  "accounts": [
    "fc9cb637-3f52-4c53-8ad5-6ca1705dce69",
    "a671f1c5-9cc1-475b-b2e6-1bad3f21b90b",
    "57d24c4e-f5d6-4a77-9e36-0535b6958911"
  ],
  "loans_metrics": {
    "num_accounts": 1,
    "sum_loans_principal": null,
    "sum_loans_outstanding": null,
    "sum_loans_monthly_payment": null
  },
  "balances_metrics": {
    "max_balance": 67779.0,
    "min_balance": 67779.0,
    "closing_balance": 67779.0,
    "balance_threshold_x": 1000.0,
    "days_balance_below_0": 0.0,
    "days_balance_below_x": 0.0
  },
  "cashflow_metrics": {
    "sum_negative_1m": 0.0,
    "sum_negative_1w": 0.0,
    "sum_negative_3m": 73716.74,
    "sum_positive_1m": 0.0,
    "sum_positive_1w": 0.0,
    "sum_positive_3m": 82305.25,
    "positive_to_negative_ratio_1m": null,
    "positive_to_negative_ratio_1w": null,
    "positive_to_negative_ratio_3m": 1.12
  },
  "credit_cards_metrics": {
    "num_accounts": 1,
    "sum_credit_used": null,
    "sum_credit_limit": null
  },
  "transactions_metrics": {
    "num_transactions_1m": 0,
    "num_transactions_1w": 0,
    "num_transactions_3m": 34,
    "max_incoming_amount_1m": 0,
    "max_incoming_amount_1w": 0,
    "max_incoming_amount_3m": 9789.98,
    "max_outgoing_amount_1m": 0,
    "max_outgoing_amount_1w": 0,
    "max_outgoing_amount_3m": 8646.72,
    "sum_incoming_amount_1m": 0,
    "sum_incoming_amount_1w": 0,
    "sum_incoming_amount_3m": 82305.25,
    "sum_outgoing_amount_1m": 0,
    "sum_outgoing_amount_1w": 0,
    "sum_outgoing_amount_3m": 63914.13,
    "mean_incoming_amount_1m": 0,
    "mean_incoming_amount_1w": 0,
    "mean_incoming_amount_3m": 4331.86,
    "mean_outgoing_amount_1m": 0,
    "mean_outgoing_amount_1w": 0,
    "mean_outgoing_amount_3m": 4260.94,
    "num_incoming_transactions_1m": 0,
    "num_incoming_transactions_1w": 0,
    "num_incoming_transactions_3m": 19,
    "num_outgoing_transactions_1m": 0,
    "num_outgoing_transactions_1w": 0,
    "num_outgoing_transactions_3m": 15
  }
};

class RiskInsightsAPIMocker extends APIMocker {
  replyToCreateRiskInsights() {
    this.scope
      .post('/api/risk-insights/', {link: linkId})
      .basicAuth({ user: 'secret-id', pass: 'secret-password' })
      .reply(201, riskInsightsResp);
  }

  replyToCreateRiskInsightsWithOptions() {
    this.scope
      .post('/api/risk-insights/', {
        link: linkId,
        save_data: false,
      })
      .basicAuth({ user: 'secret-id', pass: 'secret-password' })
      .reply(200, riskInsightsResp);
  }

  replyToResumeSession() {
    this.scope
      .patch('/api/risk-insights/', { session: 'abc123', token: 'my-token', link: linkId })
      .basicAuth({ user: 'secret-id', pass: 'secret-password' })
      .reply(200, riskInsightsResp);
  }
}

const mocker = new RiskInsightsAPIMocker('https://fake.api');

beforeEach(async () => {
  nock.cleanAll();
});

test('can retrieve risk insights', async () => {
   mocker.login().replyToCreateRiskInsights();

   const session = await newSession();
   const riskInsights = new RiskInsights(session);
   const result = await riskInsights.retrieve(linkId);

   expect(result).toEqual(riskInsightsResp);
   expect(mocker.scope.isDone()).toBeTruthy();
});

test('can retrieve risk insights with options', async () => {
  mocker.login().replyToCreateRiskInsightsWithOptions();

  const session = await newSession();
  const riskInsights = new RiskInsights(session);
  const options = {
    saveData: false
  };
  const result = await riskInsights.retrieve(linkId, options);

  expect(result).toEqual(riskInsightsResp);
  expect(mocker.scope.isDone()).toBeTruthy();
});

test('can resume risk insights session', async () => {
  mocker.login().replyToResumeSession();

  const session = await newSession();
  const riskInsights = new RiskInsights(session);
  const result = await riskInsights.resume('abc123', 'my-token', linkId);

  expect(result).toEqual(riskInsightsResp);
  expect(mocker.scope.isDone()).toBeTruthy();
});
