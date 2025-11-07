# Curl commands examples to check the webconsole api

## Sync SSM

```bash
curl -X GET http://192.168.12.11:35000/sync-ssm/sync-key \
  -H "Accept: application/json"
```

```bash
curl -X GET http://192.168.12.11:35000/sync-ssm/check-k4-life \
  -H "Accept: application/json"
```

```bash
curl -X GET http://192.168.12.11:35000/sync-ssm/k4-rotation \
  -H "Accept: application/json"
```
