import Resource from './resources';

/**
 * A RiskInsights object contains a summary of credit risk metrics for a Link
 * @extends Resource
 */

class RiskInsights extends Resource {
  #endpoint = 'api/risk-insights/' // eslint-disable-line no-use-before-define

  /**
   * Retrieve risk insights from a specific banking link.
   *
   * @async
   * @param {string} link - UUID4 representation of a link Id.
   * @param {object} options - Optional parameters (saveData)
   * @returns {object} Response
   * @throws {RequestError}
   */
  async retrieve(link, options = {}) {
    const {
      saveData,
    } = options;
    const result = await this.session.post(this.#endpoint, {
      link,
      save_data: saveData,
    });
    return result;
  }
}

export default RiskInsights;
