
## Priorities

During conversion, after all the backend and user-supplied pipelines have been gathered, priorities are used to sort the
pipelines into their order-of-execution.

Some standard conventions used for these priorities are listed below.

| Priority | Description                                                                                                                    |
| -------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `10`     | Log source pipelines like for Sysmon                                                                                           |
| `20`     | Pipelines provided by backend packages that should be run before the backend pipeline.                                         |
| `50`     | Backend pipelines that are integrated in the backend and applied automatically.                                                |
| `60`     | Backend output format pipelines that are integrated in the backend and applied automatically for the associated output format. |

::: tip Tip:
Pipelines are executed from the lowest priority to the highest.
:::

::: info Note:

- Pipelines with the same priority are applied in the order they were provided.
- Pipelines without a priority are assumed to have the Priority 0.

:::
