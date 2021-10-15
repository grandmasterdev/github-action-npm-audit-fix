# npm audit fix

Action to try and fix npm vulnerabilities via npm audit fix and create a PR if it's done.

## Dependency

* [Github Action - Checkout](https://github.com/marketplace/actions/checkout)

## How to use it

Create a step in your job that will use the action as follows:

```yaml
-  uses: actions/checkout

-  uses: grandmasterdev/github-action-npm-audit-fix
        with:
          working-dir: ${{github.workspace}}
          github-user: 'action-committer'
          github-email: 'action-committer'
          github-token: ${{github.token}}
          github-remote: 'origin'

```

### Getting the working directory

The working directory can be retrieve from various ways, but the easiest is by environment variables.
You can get the value by adding the following action before this action in the steps.

```yaml
name: Get working directory list
      run: |
        WD=$(pwd)
        echo "wd=${WD}" >> $GITHUB_ENV
      id: working-dir

```

Alternatively, you could use github action `context` to get the working directory via 

```
${{github.workspace}}
```

With the above, you can then access the value of the working directory via the environment variable like the following:

```yaml
- name: Get working directory list
      run: |
        WD=$(pwd)
        echo "wd=${WD}" >> $GITHUB_ENV
      id: working-dir

- uses: grandmasterdev/github-action-npm-audit-fix
      with:
        working-dir: ${{env.wd}}
```

or if you are using `context`

```yaml
- uses: grandmasterdev/github-action-npm-audit-fix
      with:
        working-dir: ${{github.workspace}}
```

## Inputs


| Name          | Description                                                               | Required?          |
| ------------- | ------------------------------------------------------------------------- | ------------------ |
| working-dir   | The directory where the code is being checkout                            | :heavy_check_mark: |
| github-user   | The user that will be use as committer. Default `github-action-committer` | :x:                |
| github-email  | The user email that will be user as committer                             | :heavy_check_mark: |
| github-remote | The git remote `name`. Default `origin`                                   | :x:                |
| github-token  | The github access token to authenticate action operation                  | :heavy_check_mark: |

## Outputs

| Name       | Description                                   | Type    |
| ---------- | --------------------------------------------- | ------- |
| is_updated | Inform if the version has been updated or not | boolean |
