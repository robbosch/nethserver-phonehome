Summary: NethServer phone-home
Name: nethserver-phonehome
Version: 1.1.0
Release: 1%{?dist}
License: GPL
URL: %{url_prefix}/%{name} 
Source0: %{name}-%{version}.tar.gz
BuildArch: noarch

Requires: nethserver-base
BuildRequires: nethserver-devtools 

%description
NethServer simple phone-home software.

%prep
%setup

%build
perl createlinks

%install
rm -rf %{buildroot}
(cd root; find . -depth -print | cpio -dump %{buildroot})
%{genfilelist} %{buildroot} > %{name}-%{version}-filelist

%files -f %{name}-%{version}-filelist
%defattr(-,root,root)
%config(noreplace) %attr(644,root,root) /etc/sysconfig/phone-home 
%doc COPYING
%dir %{_nseventsdir}/%{name}-update

%changelog
* Tue Mar 03 2015 Davide Principi <davide.principi@nethesis.it> - 1.1.0-1
- nethserver-devbox replacements - Feature #3009 [NethServer]
- Phone home wizard page - Feature #2997 [NethServer]

* Fri Dec 19 2014 Giacomo Sanchietti <giacomo.sanchietti@nethesis.it> - 1.0.1-1.ns6
- Phone Home: generate uuid  - Bug #2988 [NethServer]

* Tue Dec 16 2014 Giacomo Sanchietti <giacomo.sanchietti@nethesis.it> - 1.0.0-1.ns6
- First release of phone home - Feature #2975 [NethServer]

