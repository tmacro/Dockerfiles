FROM mcr.microsoft.com/dotnet/sdk:7.0 as builder

ARG DNS_LIB_VERSION="7bc6ae603e47b013c1c331926ca4095d6e9c3fbe"
ARG DNS_SERVER_VERSION="v11.5.3"

WORKDIR /build

RUN apt-get update \
    && apt-get install -y wget \
    && wget -O packages-microsoft-prod.deb https://packages.microsoft.com/config/debian/11/packages-microsoft-prod.deb \
    && dpkg -i packages-microsoft-prod.deb \
    && rm packages-microsoft-prod.deb

RUN apt-get update \
    && apt-get install -y libmsquic git

RUN git clone https://github.com/TechnitiumSoftware/TechnitiumLibrary.git TechnitiumLibrary \
    && cd TechnitiumLibrary \
    && git checkout "$DNS_LIB_VERSION"

RUN git clone https://github.com/TechnitiumSoftware/DnsServer.git DnsServer \
    && cd DnsServer \
    && git checkout "$DNS_SERVER_VERSION"

RUN dotnet build TechnitiumLibrary/TechnitiumLibrary.ByteTree/TechnitiumLibrary.ByteTree.csproj -c Release \
    && dotnet build TechnitiumLibrary/TechnitiumLibrary.Net/TechnitiumLibrary.Net.csproj -c Release \
    && dotnet publish DnsServer/DnsServerApp/DnsServerApp.csproj -c Release \
    && dotnet publish DnsServer/Apps/AdvancedBlockingApp/AdvancedBlockingApp.csproj -c Release \
    && dotnet publish DnsServer/Apps/AutoPtrApp/AutoPtrApp.csproj -c Release \
    && dotnet publish DnsServer/Apps/SplitHorizonApp/SplitHorizonApp.csproj -c Release


FROM mcr.microsoft.com/dotnet/aspnet:7.0

RUN apt-get update \
    && apt-get install -y wget \
    && wget -O packages-microsoft-prod.deb https://packages.microsoft.com/config/debian/11/packages-microsoft-prod.deb \
    && dpkg -i packages-microsoft-prod.deb \
    && rm packages-microsoft-prod.deb \
    && apt-get update \
    && apt-get install -y \
        libmsquic \
        dnsutils

COPY --chmod=0755 docker-entrypoint.sh /docker-entrypoint.sh

WORKDIR /opt/technitium/apps

COPY --from=builder ["/build/DnsServer/Apps/SplitHorizonApp/bin/Release/publish/", "./Split Horizon"]
COPY --from=builder ["/build/DnsServer/Apps/AutoPtrApp/bin/Release/publish/", "./Auto PTR"]
COPY --from=builder ["/build/DnsServer/Apps/AdvancedBlockingApp/bin/Release/publish/", "./Advanced Blocking"]

WORKDIR /opt/technitium/dns/

COPY --from=builder /build/DnsServer/DnsServerApp/bin/Release/publish/ ./

EXPOSE 5380/tcp
EXPOSE 53443/tcp
EXPOSE 53/udp
EXPOSE 53/tcp
EXPOSE 853/udp
EXPOSE 853/tcp
EXPOSE 443/udp
EXPOSE 443/tcp
EXPOSE 80/tcp
EXPOSE 8053/tcp
EXPOSE 67/udp

STOPSIGNAL SIGINT

CMD ["/docker-entrypoint.sh"]
