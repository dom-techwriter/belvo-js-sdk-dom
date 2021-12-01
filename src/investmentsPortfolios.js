import Resource from './resources';

/**
 * An InvestmentsPortfolio is a comprehensive view of your user's current
 * investment holdings
 * @extends Resource
 */
class InvestmentsPortfolio extends Resource {
  #endpoint = 'investments/portfolios/'

  /**
   * Retrieve investments portfolios from an existing link
   * @async
   * @param {string} link UUID4 representation of a Link Id.
   * @param {object} options - Optional parameters (token, saveData)
   * @return {object} Response
   * @throws {RequestError}
   */
  async retrieve(link, options = {}) {
    const { token, saveData } = options;
    const result = await this.session.post(this.#endpoint, {
      link,
      token,
      save_data: saveData,
    });
    return result;
  }
}

export default InvestmentsPortfolio;
