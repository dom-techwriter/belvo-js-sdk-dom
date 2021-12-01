import nock from 'nock';
import { APIMocker, newSession } from './fixtures';
import InvestmentsPortfolio from '../src/investmentsPortfolios';

const investmentsPortfolio = {
  id: '30cb4806-6e00-48a4-91c9-ca55968576c8',
  name: 'Fundos de Investimento',
  type: 'FUND',
  balance_gross: 76,
  balance_net: 77.69,
  currency: 'BRL',
  instruments: []
};

const linkId = 'ef68519c-8004-4a8d-a74a-2a64c3cdc778';

class InvestmentsPortfolioAPIMocker extends APIMocker {
  replyWithListOfInvestmentsPortfolios() {
    this.scope
      .get('/investments/portfolios/')
      .basicAuth({ user: 'secret-id', pass: 'secret-password' })
      .reply(
        200,
        {
          count: 1,
          next: null,
          previous: null,
          results: [investmentsPortfolio],
        },
      );
    return this;
  }

  replyToInvestmentsPortfoliosDetail() {
    this.scope
      .get(`/investments/portfolios/${investmentsPortfolio.id}/`)
      .basicAuth({ user: 'secret-id', pass: 'secret-password' })
      .reply(200, investmentsPortfolio);
  }

  replyToDeleteInvestmentsPortfolios() {
    this.scope
      .delete(`/investments/portfolios/${investmentsPortfolio.id}/`)
      .basicAuth({ user: 'secret-id', pass: 'secret-password' })
      .reply(204);
  }

  replyToCreateInvestmentsPortfolios() {
    this.scope
      .post('/investments/portfolios/', { link: linkId })
      .basicAuth({ user: 'secret-id', pass: 'secret-password' })
      .reply(201, investmentsPortfolio);
  }

  replyToCreateInvestmentsPortfoliosWithOptions() {
    this.scope
      .post('/investments/portfolios/', {
        link: linkId, save_data: false, token: 'token123',
      })
      .basicAuth({ user: 'secret-id', pass: 'secret-password' })
      .reply(201, investmentsPortfolio);
  }

  replyToResumeSession() {
    this.scope
      .patch('/investments/portfolios/', { session: 'abc123', token: 'my-token', link: linkId })
      .basicAuth({ user: 'secret-id', pass: 'secret-password' })
      .reply(200, investmentsPortfolio);
  }
}

const mocker = new InvestmentsPortfolioAPIMocker('https://fake.api');

beforeEach(async () => {
  nock.cleanAll();
});

test('can list investments portfolios', async () => {
  mocker.login().replyWithListOfInvestmentsPortfolios();

  const session = await newSession();
  const investmentsPortfolios = new InvestmentsPortfolio(session);
  const result = await investmentsPortfolios.list();

  expect(result).toEqual([investmentsPortfolio]);
});

test('can retrieve investments portfolios', async () => {
  mocker.login().replyToCreateInvestmentsPortfolios();

  const session = await newSession();
  const investmentsPortfolios = new InvestmentsPortfolio(session);
  const result = await investmentsPortfolios.retrieve(linkId);

  expect(result).toEqual(investmentsPortfolio);
  expect(mocker.scope.isDone()).toBeTruthy();
});

test('can retrieve investments portfolios with options', async () => {
  mocker.login().replyToCreateInvestmentsPortfoliosWithOptions();

  const session = await newSession();
  const investmentsPortfolios = new InvestmentsPortfolio(session);
  const options = {
    token: 'token123',
    saveData: false,
  };
  const result = await investmentsPortfolios.retrieve(linkId, options);

  expect(result).toEqual(investmentsPortfolio);
  expect(mocker.scope.isDone()).toBeTruthy();
});

test('can see investments portfolios detail', async () => {
  mocker.login().replyToInvestmentsPortfoliosDetail();

  const session = await newSession();
  const investmentsPortfolios = new InvestmentsPortfolio(session);
  const result = await investmentsPortfolios.detail(investmentsPortfolio.id);

  expect(result).toEqual(investmentsPortfolio);
});

test('can delete investments portfolios', async () => {
  mocker.login().replyToDeleteInvestmentsPortfolios();

  const session = await newSession();
  const investmentsPortfolios = new InvestmentsPortfolio(session);
  const result = await investmentsPortfolios.delete(investmentsPortfolio.id);

  expect(result).toBeTruthy();
  expect(mocker.scope.isDone).toBeTruthy();
});

test('can resume investments portfolios session', async () => {
  mocker.login().replyToResumeSession();

  const session = await newSession();
  const investmentsPortfolios = new InvestmentsPortfolio(session);
  const result = await investmentsPortfolios.resume('abc123', 'my-token', linkId);

  expect(result).toEqual(investmentsPortfolio);
  expect(mocker.scope.isDone()).toBeTruthy();
});
