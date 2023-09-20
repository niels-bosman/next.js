import { PosixMockFileReader } from '../../../helpers/file-reader/helpers/mock-file-reader'
import { RouteKind } from '../../../route-kind'
import { AppPageRouteDefinition } from '../../app-page-route-definition'
import { DevAppPageRouteDefinitionProvider } from './dev-app-page-route-definition-provider'

describe('DevAppPageRouteDefinitionProvider', () => {
  const dir = '<root>'
  const extensions = ['ts', 'tsx', 'js', 'jsx']

  it('returns no routes with an empty filesystem', async () => {
    const reader = new PosixMockFileReader()
    const spy = jest.spyOn(reader, 'read')
    const provider = new DevAppPageRouteDefinitionProvider(
      dir,
      extensions,
      reader
    )
    const definitions = await provider.provide()
    expect(definitions).toHaveLength(0)
    expect(spy).toBeCalledWith(dir, { recursive: true })
  })

  describe('filename matching', () => {
    it.each<{
      files: ReadonlyArray<string>
      route: AppPageRouteDefinition
    }>([
      {
        files: [`${dir}/(marketing)/about/page.ts`],
        route: {
          kind: RouteKind.APP_PAGE,
          identity: '/about',
          pathname: '/about',
          filename: `${dir}/(marketing)/about/page.ts`,
          page: '/(marketing)/about/page',
          bundlePath: 'app/(marketing)/about/page',
          appPaths: ['/(marketing)/about/page'],
        },
      },
      {
        files: [`${dir}/(marketing)/about/page.ts`],
        route: {
          kind: RouteKind.APP_PAGE,
          identity: '/about',
          pathname: '/about',
          filename: `${dir}/(marketing)/about/page.ts`,
          page: '/(marketing)/about/page',
          bundlePath: 'app/(marketing)/about/page',
          appPaths: ['/(marketing)/about/page'],
        },
      },
      {
        files: [`${dir}/some/other/page.ts`],
        route: {
          kind: RouteKind.APP_PAGE,
          identity: '/some/other',
          pathname: '/some/other',
          filename: `${dir}/some/other/page.ts`,
          page: '/some/other/page',
          bundlePath: 'app/some/other/page',
          appPaths: ['/some/other/page'],
        },
      },
      {
        files: [`${dir}/page.ts`],
        route: {
          kind: RouteKind.APP_PAGE,
          identity: '/',
          pathname: '/',
          filename: `${dir}/page.ts`,
          page: '/page',
          bundlePath: 'app/page',
          appPaths: ['/page'],
        },
      },
    ])(
      "matches the '$route.page' route specified with the provided files",
      async ({ files, route }) => {
        const reader = new PosixMockFileReader([
          ...extensions.map((ext) => `${dir}/some/route.${ext}`),
          ...extensions.map((ext) => `${dir}/api/other.${ext}`),
          ...files,
        ])
        const spy = jest.spyOn(reader, 'read')
        const provider = new DevAppPageRouteDefinitionProvider(
          dir,
          extensions,
          reader
        )
        const definitions = await provider.provide()
        expect(definitions).toHaveLength(1)
        expect(spy).toBeCalledWith(dir, { recursive: true })
        expect(definitions[0]).toEqual(route)
      }
    )
  })
})