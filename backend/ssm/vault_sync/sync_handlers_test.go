package vaultsync

import (
	"testing"
)

func TestSyncMutexesInitialized(t *testing.T) {
	// Test that mutexes are initialized and can be locked/unlocked

	SyncOurKeysMutex.Lock()
	SyncOurKeysMutex.Unlock()

	SyncExternalKeysMutex.Lock()
	SyncExternalKeysMutex.Unlock()

	SyncUserMutex.Lock()
	SyncUserMutex.Unlock()
}

func TestCoreVaultUserSync(t *testing.T) {
	// Set stop condition to prevent actual DB operations
	setStopCondition(true)
	defer func() {
		setStopCondition(false)
	}()

	// This should not panic
	defer func() {
		if r := recover(); r != nil {
			t.Errorf("coreVaultUserSync panicked: %v", r)
		}
	}()

	coreVaultUserSync()
}

func TestCoreVaultUserSyncNormal(t *testing.T) {
	// Set stop condition to false but expect DB errors
	setStopCondition(false)

	// This should not panic even without DB
	defer func() {
		if r := recover(); r != nil {
			t.Errorf("coreVaultUserSync panicked: %v", r)
		}
	}()

	coreVaultUserSync()
}
