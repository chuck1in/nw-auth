import { OidcResp } from '../dto/common'
import { OidcService } from './core'
import { url as githubApi } from '../data/github'
import * as GithubDto from '../dto/github'
import { AccessTokenError, UserInfoError } from '../error/error'

type Platform = 'github'
export class GithubOidc extends OidcService {
  private readonly clientId: string
  private readonly redirectUrl: string
  private readonly clientSecret: string

  constructor (clientId, clientSecret, redirectUrl) {
    super()
    this.clientId = clientId
    this.clientSecret = clientSecret
    this.redirectUrl = redirectUrl
  }

  async redirectLogin (): Promise<OidcResp<'redirect', Platform>> {
    const redirectLoginUrl = new URL(githubApi.redirectLogin)
    const param: GithubDto.RedirectReq = {
      client_id: this.clientId,
      redirect_uri: this.redirectUrl,
      state: super.createState()
    }
    Object.entries(param).forEach(([k, v]) => {
      redirectLoginUrl.searchParams.append(k, v)
    })
    return await Promise.resolve({
      type: 'redirect',
      result: redirectLoginUrl.toString()
    })
  }

  async getAccessToken (code: string, state: string): Promise<OidcResp<'accessToken', Platform>> {
    if (!super.checkState(state)) {
      return await Promise.reject(new AccessTokenError('state invalid'))
    }
    if (code === '') {
      return await Promise.reject(new AccessTokenError('code invalid'))
    }
    const accessTokenUrl = new URL(githubApi.accessToken)
    const param: GithubDto.AccessTokenReq = {
      client_id: this.clientId,
      client_secret: this.clientSecret,
      code,
      redirect_uri: this.redirectUrl
    }
    Object.entries(param).forEach(([k, v]) => {
      accessTokenUrl.searchParams.append(k, v)
    })
    return await this.requestPromise(accessTokenUrl, { Accept: 'application/json' }).then((res) => {
      const resp = JSON.parse(res)
      if (resp.access_token === undefined) {
        throw new AccessTokenError('access token response not valid')
      }
      return {
        type: 'accessToken',
        result: resp
      }
    })
  }

  async getUserInfo (resp: OidcResp<'accessToken', Platform>): Promise<OidcResp<'userInfo', Platform>> {
    const userInfoUrl = new URL(githubApi.userInfo)
    return await this.requestPromise(userInfoUrl
      , {
        Authorization: `token ${resp.result.access_token}`,
        Accept: 'application/json'
      }
    ).then((res) => {
      const resp = JSON.parse(res)
      if (resp.id === undefined) {
        throw new UserInfoError('userInfo response not valid')
      }
      return {
        type: 'userInfo',
        result: resp
      }
    })
  }
}
