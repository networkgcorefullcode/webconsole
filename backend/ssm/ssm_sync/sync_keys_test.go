package ssmsync

import (
	"testing"

	"github.com/omec-project/webconsole/backend/ssm"
)

func TestSyncOurKeysMutex(t *testing.T) {
	// Test that SyncOurKeysMutex is initialized and can be locked/unlocked
	SyncOurKeysMutex.Lock()
	SyncOurKeysMutex.Unlock()
}

func TestSyncExternalKeysMutex(t *testing.T) {
	// Test that SyncExternalKeysMutex is initialized and can be locked/unlocked
	SyncExternalKeysMutex.Lock()
	SyncExternalKeysMutex.Unlock()
}

func TestSyncUserMutexSSM(t *testing.T) {
	// Test that SyncUserMutex is initialized and can be locked/unlocked
	SyncUserMutex.Lock()
	SyncUserMutex.Unlock()
}

func TestSyncOurKeysFunction(t *testing.T) {
	// Set stop condition to prevent actual operations
	StopSSMsyncFunction = true
	defer func() {
		StopSSMsyncFunction = false
	}()

	// This should not panic
	defer func() {
		if r := recover(); r != nil {
			t.Errorf("syncOurKeys panicked: %v", r)
		}
	}()

	syncOurKeys("SYNC_OUR_KEYS")
}

func TestSyncExternalKeysFunction(t *testing.T) {
	// Set stop condition to prevent actual operations
	StopSSMsyncFunction = true
	defer func() {
		StopSSMsyncFunction = false
	}()

	// This should not panic
	defer func() {
		if r := recover(); r != nil {
			t.Errorf("syncExternalKeys panicked: %v", r)
		}
	}()

	syncExternalKeys("SYNC_EXTERNAL_KEYS")
}

func TestSyncKeyListenChannel(t *testing.T) {
	ssmSyncMsg := make(chan *ssm.SsmSyncMessage, 10)

	// Start the listener in a goroutine
	go SyncKeyListen(ssmSyncMsg)

	// Set stop condition to prevent actual operations
	StopSSMsyncFunction = true
	defer func() {
		StopSSMsyncFunction = false
	}()

	// Send test messages
	ssmSyncMsg <- &ssm.SsmSyncMessage{
		Action: "SYNC_OUR_KEYS",
		Info:   "Test sync",
	}

	ssmSyncMsg <- &ssm.SsmSyncMessage{
		Action: "SYNC_EXTERNAL_KEYS",
		Info:   "Test sync external",
	}

	ssmSyncMsg <- &ssm.SsmSyncMessage{
		Action: "SYNC_USERS",
		Info:   "Test sync users",
	}

	// Close channel to stop listener
	close(ssmSyncMsg)
}
