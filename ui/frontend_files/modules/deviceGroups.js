// SPDX-License-Identifier: Apache-2.0
// Copyright 2024 Canonical Ltd.

import { BaseManager } from './baseManager.js';

export class DeviceGroupManager extends BaseManager {
    constructor() {
        super('/device-group', 'device-groups-list');
        this.type = 'device-group';
        this.displayName = 'Device Group';
    }

    render(groups) {
        const container = document.getElementById(this.containerId);
        
        if (!groups || groups.length === 0) {
            this.showEmpty('No device groups found');
            return;
        }
        
        let html = '<div class="table-responsive"><table class="table table-striped">';
        html += '<thead><tr><th>Group Name</th><th>IMSIs</th><th>Site Info</th><th>IP Domain</th><th>Actions</th></tr></thead><tbody>';
        
        groups.forEach(group => {
            const groupName = group['group-name'] || group.name || 'N/A';
            const imsis = group.imsis || [];
            const siteInfo = group['site-info'] || 'N/A';
            const ipDomainName = group['ip-domain-name'] || 'N/A';
            
            html += `
                <tr>
                    <td><strong>${groupName}</strong></td>
                    <td>
                        <span class="badge bg-secondary">${imsis.length} IMSIs</span>
                        ${imsis.length > 0 ? `<br><small class="text-muted">${imsis.slice(0, 3).join(', ')}${imsis.length > 3 ? '...' : ''}</small>` : ''}
                    </td>
                    <td>${siteInfo}</td>
                    <td>${ipDomainName}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary me-1" 
                                onclick="editItem('${this.type}', '${groupName}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-sm btn-outline-danger" 
                                onclick="deleteItem('${this.type}', '${groupName}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </td>
                </tr>
            `;
        });
        
        html += '</tbody></table></div>';
        container.innerHTML = html;
    }

    getFormFields(isEdit = false) {
        return `
            <div class="mb-3">
                <label class="form-label">Group Name</label>
                <input type="text" class="form-control" id="group_name" 
                       ${isEdit ? 'readonly' : ''} required>
            </div>
            
            <h6 class="mt-4 mb-3">IMSI Configuration</h6>
            <div class="mb-3">
                <label class="form-label">IMSIs</label>
                <textarea class="form-control" id="imsis" rows="4" 
                          placeholder="Enter IMSIs, one per line&#10;e.g.:&#10;001010000000001&#10;001010000000002&#10;001010000000003"></textarea>
                <div class="form-text">Enter one IMSI per line (15 digits each)</div>
            </div>
            
            <h6 class="mt-4 mb-3">Site Information</h6>
            <div class="mb-3">
                <label class="form-label">Site Info</label>
                <input type="text" class="form-control" id="site_info" 
                       placeholder="e.g., site-1">
            </div>
            
            <h6 class="mt-4 mb-3">IP Domain Configuration</h6>
            <div class="mb-3">
                <label class="form-label">IP Domain Name</label>
                <input type="text" class="form-control" id="ip_domain_name" 
                       placeholder="e.g., pool1">
            </div>
            
            <h6 class="mt-4 mb-3">IP Domain Expanded (APN Configuration)</h6>
            <div class="mb-3">
                <label class="form-label">DNN (Data Network Name)</label>
                <input type="text" class="form-control" id="dnn" 
                       placeholder="e.g., internet">
            </div>
            
            <div class="row">
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="form-label">UE IP Pool</label>
                        <input type="text" class="form-control" id="ue_ip_pool" 
                               placeholder="e.g., 172.250.0.0/16">
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="form-label">MTU</label>
                        <input type="number" class="form-control" id="mtu" 
                               placeholder="e.g., 1460" min="1200" max="9000">
                    </div>
                </div>
            </div>
            
            <div class="row">
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="form-label">Primary DNS</label>
                        <input type="text" class="form-control" id="dns_primary" 
                               placeholder="e.g., 8.8.8.8">
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="form-label">Secondary DNS</label>
                        <input type="text" class="form-control" id="dns_secondary" 
                               placeholder="e.g., 8.8.4.4">
                    </div>
                </div>
            </div>
            
            <h6 class="mt-4 mb-3">QoS Configuration</h6>
            <div class="row">
                <div class="col-md-4">
                    <div class="mb-3">
                        <label class="form-label">Uplink MBR</label>
                        <input type="number" class="form-control" id="dnn_mbr_uplink" 
                               placeholder="e.g., 100" min="0">
                        <div class="form-text">Mbps</div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="mb-3">
                        <label class="form-label">Downlink MBR</label>
                        <input type="number" class="form-control" id="dnn_mbr_downlink" 
                               placeholder="e.g., 200" min="0">
                        <div class="form-text">Mbps</div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="mb-3">
                        <label class="form-label">Bitrate Unit</label>
                        <select class="form-select" id="bitrate_unit">
                            <option value="Mbps">Mbps</option>
                            <option value="Kbps">Kbps</option>
                            <option value="Gbps">Gbps</option>
                        </select>
                    </div>
                </div>
            </div>
        `;
    }

    validateFormData(data) {
        const errors = [];
        
        if (!data.group_name || data.group_name.trim() === '') {
            errors.push('Group name is required');
        }
        
        // Validate IMSIs
        if (data.imsis && data.imsis.trim() !== '') {
            const imsiList = data.imsis.split('\n').map(imsi => imsi.trim()).filter(imsi => imsi);
            for (const imsi of imsiList) {
                if (!/^\d{15}$/.test(imsi)) {
                    errors.push(`Invalid IMSI format: ${imsi}. IMSIs must be exactly 15 digits`);
                    break;
                }
            }
        }
        
        // Validate IP Pool format if provided
        if (data.ue_ip_pool && data.ue_ip_pool.trim() !== '') {
            const ipPoolRegex = /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/;
            if (!ipPoolRegex.test(data.ue_ip_pool)) {
                errors.push('UE IP Pool must be in CIDR format (e.g., 172.250.0.0/16)');
            }
        }
        
        // Validate DNS IPs if provided
        const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
        if (data.dns_primary && data.dns_primary.trim() !== '' && !ipRegex.test(data.dns_primary)) {
            errors.push('Primary DNS must be a valid IP address');
        }
        
        if (data.dns_secondary && data.dns_secondary.trim() !== '' && !ipRegex.test(data.dns_secondary)) {
            errors.push('Secondary DNS must be a valid IP address');
        }
        
        // Validate MTU range
        if (data.mtu && (data.mtu < 1200 || data.mtu > 9000)) {
            errors.push('MTU must be between 1200 and 9000');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    preparePayload(formData, isEdit = false) {
        // Process IMSIs from textarea
        const imsisList = [];
        if (formData.imsis && formData.imsis.trim() !== '') {
            imsisList.push(...formData.imsis.split('\n').map(imsi => imsi.trim()).filter(imsi => imsi));
        }

        // Prepare IP Domain Expanded structure
        const ipDomainExpanded = {};
        
        if (formData.dnn) ipDomainExpanded.dnn = formData.dnn;
        if (formData.ue_ip_pool) ipDomainExpanded['ue-ip-pool'] = formData.ue_ip_pool;
        if (formData.dns_primary) ipDomainExpanded['dns-primary'] = formData.dns_primary;
        if (formData.dns_secondary) ipDomainExpanded['dns-secondary'] = formData.dns_secondary;
        if (formData.mtu) ipDomainExpanded.mtu = parseInt(formData.mtu);

        // Prepare UE DNN QoS if any values are provided
        const ueDnnQos = {};
        if (formData.dnn_mbr_uplink) ueDnnQos['dnn-mbr-uplink'] = parseInt(formData.dnn_mbr_uplink);
        if (formData.dnn_mbr_downlink) ueDnnQos['dnn-mbr-downlink'] = parseInt(formData.dnn_mbr_downlink);
        if (formData.bitrate_unit) ueDnnQos['bitrate-unit'] = formData.bitrate_unit;
        
        if (Object.keys(ueDnnQos).length > 0) {
            ipDomainExpanded['ue-dnn-qos'] = ueDnnQos;
        }

        const payload = {
            "group-name": formData.group_name,
            "imsis": imsisList
        };

        if (formData.site_info) {
            payload["site-info"] = formData.site_info;
        }

        if (formData.ip_domain_name) {
            payload["ip-domain-name"] = formData.ip_domain_name;
        }

        if (Object.keys(ipDomainExpanded).length > 0) {
            payload["ip-domain-expanded"] = ipDomainExpanded;
        }

        return payload;
    }

    async loadItemData(name) {
        try {
            const response = await fetch(`${this.apiBase}/${name}`);
            if (response.ok) {
                const data = await response.json();
                
                // Populate basic fields
                this.setFieldValue('group_name', data['group-name']);
                this.setFieldValue('site_info', data['site-info']);
                this.setFieldValue('ip_domain_name', data['ip-domain-name']);
                
                // Populate IMSIs (convert array to textarea)
                if (data.imsis && data.imsis.length > 0) {
                    this.setFieldValue('imsis', data.imsis.join('\n'));
                }
                
                // Populate IP Domain Expanded fields
                const ipDomainExpanded = data['ip-domain-expanded'] || {};
                this.setFieldValue('dnn', ipDomainExpanded.dnn);
                this.setFieldValue('ue_ip_pool', ipDomainExpanded['ue-ip-pool']);
                this.setFieldValue('dns_primary', ipDomainExpanded['dns-primary']);
                this.setFieldValue('dns_secondary', ipDomainExpanded['dns-secondary']);
                this.setFieldValue('mtu', ipDomainExpanded.mtu);
                
                // Populate UE DNN QoS fields
                const ueDnnQos = ipDomainExpanded['ue-dnn-qos'] || {};
                this.setFieldValue('dnn_mbr_uplink', ueDnnQos['dnn-mbr-uplink']);
                this.setFieldValue('dnn_mbr_downlink', ueDnnQos['dnn-mbr-downlink']);
                this.setFieldValue('bitrate_unit', ueDnnQos['bitrate-unit'] || 'Mbps');
            }
        } catch (error) {
            console.error('Failed to load item data:', error);
        }
    }

    setFieldValue(fieldId, value) {
        const field = document.getElementById(fieldId);
        if (field && value !== undefined && value !== null) {
            field.value = value;
        }
    }
}
