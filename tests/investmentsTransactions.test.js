import nock from 'nock';
import moment from 'moment';
import { APIMocker, newSession } from './fixtures';
import InvestmentsTransaction from '../src/investmentsTransactions';

const investmentsTransaction = {
  id: 'f3cd25ba-d109-4ddf-8d29-624c26cbee3f',
  link: 'f3cd25ba-d109-4ddf-8d29-624c26cbee3f',
  collected_at: '2021-03-11T14:38:02.351Z',
  created_at: '2021-03-11T14:36:00.351Z',
  portfolio: {},
  instrument: {},
  settlement_date: '13-08-2021',
  operation_date: '07-08-2021',
  description: 'Stock acquisition',
  type: 'BUY',
  quantity: 18.25,
  amount: 18.25,
  price: 10,
  currency: 'BRL',
  fees: 18.5
};

const linkId = 'ef68519c-8004-4a8d-a74a-2a64c3cdc778';

class InvestmentsTransactionsAPIMocker extends APIMocker {
  replyWithListOfInvestmentsTransaction() {
    this.scope
      .get('/investments/transactions/')
      .basicAuth({ user: 'secret-id', pass: 'secret-password' })
      .reply(
        200,
        {
          count: 1,
          next: null,
          previous: null,
          results: [investmentsTransaction],
        },
      );
    return this;
  }

  replyToInvestmentsTransactionDetail() {
    this.scope
      .get(`/investments/transactions/${investmentsTransaction.id}/`)
      .basicAuth({ user: 'secret-id', pass: 'secret-password' })
      .reply(200, investmentsTransaction);
  }

  replyToDeleteInvestmentsTransaction() {
    this.scope
      .delete(`/investments/transactions/${investmentsTransaction.id}/`)
      .basicAuth({ user: 'secret-id', pass: 'secret-password' })
      .reply(204);
  }

  replyToCreateInvestmentsTransaction() {
    this.scope
      .post('/investments/transactions/', { link: linkId, date_from: '2019-10-20', date_to: moment().format('YYYY-MM-DD') })
      .basicAuth({ user: 'secret-id', pass: 'secret-password' })
      .reply(201, investmentsTransaction);
  }

  replyToCreateInvestmentsTransactionWithOptions() {
    this.scope
      .post('/investments/transactions/', {
        link: linkId, date_from: '2019-10-20', date_to: '2019-12-01', save_data: false, token: 'token123',
      })
      .basicAuth({ user: 'secret-id', pass: 'secret-password' })
      .reply(201, investmentsTransaction);
  }

  replyToResumeSession() {
    this.scope
      .patch('/investments/transactions/', { session: 'abc123', token: 'my-token', link: linkId })
      .basicAuth({ user: 'secret-id', pass: 'secret-password' })
      .reply(200, investmentsTransaction);
  }
}

const mocker = new InvestmentsTransactionsAPIMocker('https://fake.api');

beforeEach(async () => {
  nock.cleanAll();
});

test('can list investments transactions', async () => {
  mocker.login().replyWithListOfInvestmentsTransaction();

  const session = await newSession();
  const investmentsTransactions = new InvestmentsTransaction(session);
  const result = await investmentsTransactions.list();

  expect(result).toEqual([investmentsTransaction]);
});

test('can retrieve investments transactions', async () => {
  mocker.login().replyToCreateInvestmentsTransaction();

  const session = await newSession();
  const investmentsTransactions = new InvestmentsTransaction(session);
  const result = await investmentsTransactions.retrieve(linkId, '2019-10-20');

  expect(result).toEqual(investmentsTransaction);
  expect(mocker.scope.isDone()).toBeTruthy();
});

test('can retrieve investments transactions with options', async () => {
  mocker.login().replyToCreateInvestmentsTransactionWithOptions();

  const session = await newSession();
  const investmentsTransactions = new InvestmentsTransaction(session);
  const options = {
    dateTo: '2019-12-01',
    token: 'token123',
    saveData: false,
  };
  const result = await investmentsTransactions.retrieve(linkId, '2019-10-20', options);

  expect(result).toEqual(investmentsTransaction);
  expect(mocker.scope.isDone()).toBeTruthy();
});

test('can see investments transaction detail', async () => {
  mocker.login().replyToInvestmentsTransactionDetail();

  const session = await newSession();
  const investmentsTransactions = new InvestmentsTransaction(session);
  const result = await investmentsTransactions.detail(investmentsTransaction.id);

  expect(result).toEqual(investmentsTransaction);
});

test('can delete investments transaction', async () => {
  mocker.login().replyToDeleteInvestmentsTransaction();

  const session = await newSession();
  const investmentsTransactions = new InvestmentsTransaction(session);
  const result = await investmentsTransactions.delete(investmentsTransaction.id);

  expect(result).toBeTruthy();
  expect(mocker.scope.isDone).toBeTruthy();
});

test('can resume investments transaction session', async () => {
  mocker.login().replyToResumeSession();

  const session = await newSession();
  const investmentsTransactions = new InvestmentsTransaction(session);
  const result = await investmentsTransactions.resume('abc123', 'my-token', linkId);

  expect(result).toEqual(investmentsTransaction);
  expect(mocker.scope.isDone()).toBeTruthy();
});
