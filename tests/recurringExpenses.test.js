import nock from 'nock';
import { APIMocker, newSession } from './fixtures';
import RecurringExpense from '../src/recurring_expenses';

const linkId = 'a39facc8-8004-4a8d-a74a-2a64c3cdc779';

const recurringExpensesResp = [{
    id: "3c140ecf-456d-48a4-a911-8273a3039027",
    account: {
        id: "e1a75480-5948-42dc-9a69-4f7cc34a49d9",
        link: linkId,
        category: "CHECKING_ACCOUNT",
    },
    name: "video platform",
    transactions: [
        {
            amount: 100.00,
            description: "video platform august",
            id: "edc2c5b2-f135-477c-be0d-66332fec07ff",
            value_date: "2019-08-24"
        }
    ],
    frequency: "MONTHLY",
    average_transaction_amount: 100.00,
    median_transaction_amount: 100.00,
    days_since_last_transaction: 12,
    category: 'Online Platforms & Leisure',
    payment_type: "SUBSCRIPTION"
    }
];

class RecurringExpensesAPIMocker extends APIMocker {
  replyToCreateRecurringExpenses() {
    this.scope
      .post('/api/recurring-expenses/', {link: linkId})
      .basicAuth({ user: 'secret-id', pass: 'secret-password' })
      .reply(201, recurringExpensesResp);
  }

  replyToCreateRecurringExpensesWithOptions() {
    this.scope
      .post('/api/recurring-expenses/', {
        link: linkId,
        save_data: false,
      })
      .basicAuth({ user: 'secret-id', pass: 'secret-password' })
      .reply(200, recurringExpensesResp);
  }

  replyToResumeSession() {
    this.scope
      .patch('/api/recurring-expenses/', { session: 'abc123', token: 'my-token', link: linkId })
      .basicAuth({ user: 'secret-id', pass: 'secret-password' })
      .reply(200, recurringExpensesResp);
  }
}

const mocker = new RecurringExpensesAPIMocker('https://fake.api');

beforeEach(async () => {
  nock.cleanAll();
});

test('can retrieve recurring expenses', async () => {
   mocker.login().replyToCreateRecurringExpenses();

   const session = await newSession();
   const recurringExpenses = new RecurringExpense(session);
   const result = await recurringExpenses.retrieve(linkId);

   expect(result).toEqual(recurringExpensesResp);
   expect(mocker.scope.isDone()).toBeTruthy();
});

test('can retrieve recurring expenses with options', async () => {
  mocker.login().replyToCreateRecurringExpensesWithOptions();

  const session = await newSession();
  const recurringExpenses = new RecurringExpense(session);
  const options = {
    saveData: false
  };
  const result = await recurringExpenses.retrieve(linkId, options);

  expect(result).toEqual(recurringExpensesResp);
  expect(mocker.scope.isDone()).toBeTruthy();
});

test('can resume recurring expenses session', async () => {
  mocker.login().replyToResumeSession();

  const session = await newSession();
  const recurringExpenses = new RecurringExpense(session);
  const result = await recurringExpenses.resume('abc123', 'my-token', linkId);

  expect(result).toEqual(recurringExpensesResp);
  expect(mocker.scope.isDone()).toBeTruthy();
});
