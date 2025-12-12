package ssmsync

import (
	"testing"

	"github.com/omec-project/webconsole/backend/ssm"
)

func TestSetSyncChanHandle(t *testing.T) {
	ch := make(chan *ssm.SsmSyncMessage, 1)

	setSyncChanHandle(ch)

	if ssmSyncMessage != ch {
		t.Error("setSyncChanHandle should set the global ssmSyncMessage channel")
	}
}

func TestSetSyncChanHandleNilChannel(t *testing.T) {
	setSyncChanHandle(nil)

	if ssmSyncMessage != nil {
		t.Error("setSyncChanHandle should accept nil channel")
	}
}

func TestSyncMutexesInitialized(t *testing.T) {
	// Test that mutexes are initialized
	// We can't directly test mutex state, but we can test Lock/Unlock

	SyncOurKeysMutex.Lock()
	SyncOurKeysMutex.Unlock()

	SyncExternalKeysMutex.Lock()
	SyncExternalKeysMutex.Unlock()

	SyncUserMutex.Lock()
	SyncUserMutex.Unlock()
}
