import { OidcResp, Platform } from '../dto/common'
import { OidcService } from '../service/core'

export class OidcServiceSpy extends OidcService {
  async redirectLogin (redirectUrl: string): Promise<OidcResp<'redirect', Platform>> {
    throw new Error('Method not implemented.')
  }

  async getAccessToken (
    code: string,
    state: string
  ): Promise<OidcResp<'accessToken', Platform>> {
    throw new Error('Method not implemented.')
  }

  async getUserInfo (
    resp
  ): Promise<OidcResp<'userInfo', Platform>> {
    throw new Error('Method not implemented.')
  }

  createState (): string {
    return super.createState()
  }

  checkState (state: string): boolean {
    return super.checkState(state)
  }
}
